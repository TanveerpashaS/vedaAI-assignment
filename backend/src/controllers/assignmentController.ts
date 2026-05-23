import { Request, Response } from 'express';
import { MulterRequest } from '../types/multer';
import { Assignment } from '../models/Assignment';
import { getAssessmentQueue } from '../queues/assessmentQueue';
import { getRedisClient } from '../config/redis';
import { generateAssessment } from '../services/aiService';
import { emitProgress } from '../socket/socketManager';
import { z } from 'zod';

const QuestionTypeSchema = z.object({
  type: z.string().min(1, 'Question type is required'),
  count: z.number().int().min(1, 'Count must be at least 1'),
  marks: z.number().int().min(1, 'Marks must be at least 1'),
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(100),
  className: z.string().min(1, 'Class is required').max(50),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z
    .array(QuestionTypeSchema)
    .min(1, 'At least one question type is required'),
  additionalInstructions: z.string().optional().default(''),
});

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse questionTypes if it's a string (from FormData)
    if (typeof req.body.questionTypes === 'string') {
      try {
        req.body.questionTypes = JSON.parse(req.body.questionTypes);
      } catch {
        res.status(400).json({ success: false, error: 'Invalid questionTypes format' });
        return;
      }
    }

    const validation = CreateAssignmentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues,
      });
      return;
    }

    const data = validation.data;
    const totalQuestions = data.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
    const totalMarks = data.questionTypes.reduce(
      (sum, qt) => sum + qt.count * qt.marks,
      0
    );

    const multerReq = req as MulterRequest;
    const assignment = new Assignment({
      ...data,
      dueDate: new Date(data.dueDate),
      totalQuestions,
      totalMarks,
      fileUrl: multerReq.file ? `/uploads/${multerReq.file.filename}` : undefined,
      fileName: multerReq.file?.originalname,
    });

    await assignment.save();

    // Try to add to queue, fallback to direct processing
    let jobId: string | undefined;
    try {
      const queue = getAssessmentQueue();
      const job = await queue.add('generate-assessment', {
        assignmentId: assignment._id.toString(),
        title: data.title,
        subject: data.subject,
        className: data.className,
        questionTypes: data.questionTypes,
        additionalInstructions: data.additionalInstructions || '',
      });
      jobId = job.id;
      await assignment.updateOne({ jobId });
    } catch (queueError) {
      console.warn('Queue not available, processing directly');
      // Process directly without queue
      processDirectly(assignment._id.toString(), {
        assignmentId: assignment._id.toString(),
        title: data.title,
        subject: data.subject,
        className: data.className,
        questionTypes: data.questionTypes,
        additionalInstructions: data.additionalInstructions || '',
      });
    }

    res.status(201).json({
      success: true,
      data: {
        assignmentId: assignment._id,
        jobId,
        status: 'pending',
        message: 'Assignment created and queued for AI generation',
      },
    });
  } catch (error: any) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create assignment',
      message: error.message,
    });
  }
};

// Direct processing fallback when Redis/BullMQ not available
const processDirectly = async (assignmentId: string, data: any): Promise<void> => {
  try {
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
    emitProgress(assignmentId, 20, 'Starting AI generation...', 'processing');

    setTimeout(async () => {
      try {
        emitProgress(assignmentId, 50, 'Generating questions...', 'processing');
        const generatedPaper = await generateAssessment(data);
        emitProgress(assignmentId, 90, 'Finalizing paper...', 'processing');

        await Assignment.findByIdAndUpdate(assignmentId, {
          status: 'completed',
          generatedPaper,
        });

        emitProgress(assignmentId, 100, 'Question paper ready!', 'completed');
      } catch (err: any) {
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: 'failed',
          errorMessage: err.message,
        });
        emitProgress(assignmentId, 0, `Failed: ${err.message}`, 'failed');
      }
    }, 500);
  } catch (err) {
    console.error('Direct processing error:', err);
  }
};

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Try cache first
    const cacheKey = `assignments:${JSON.stringify(query)}:${pageNum}:${limitNum}`;
    try {
      const redis = getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.json(JSON.parse(cached));
        return;
      }
    } catch {}

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-generatedPaper.answerKey')
        .lean(),
      Assignment.countDocuments(query),
    ]);

    const response = {
      success: true,
      data: assignments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    // Cache for 30 seconds
    try {
      const redis = getRedisClient();
      await redis.setex(cacheKey, 30, JSON.stringify(response));
    } catch {}

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id).lean();

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    res.json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    // Invalidate cache
    try {
      const redis = getRedisClient();
      const keys = await redis.keys('assignments:*');
      if (keys.length > 0) await redis.del(keys[0], ...keys.slice(1));
    } catch {}

    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const regenerateAssignment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    await assignment.updateOne({ status: 'pending', generatedPaper: undefined });

    // Try queue, fallback to direct
    try {
      const queue = getAssessmentQueue();
      await queue.add('generate-assessment', {
        assignmentId: id,
        title: assignment.title,
        subject: assignment.subject,
        className: assignment.className,
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
      });
    } catch {
      processDirectly(id, {
        assignmentId: id,
        title: assignment.title,
        subject: assignment.subject,
        className: assignment.className,
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
      });
    }

    res.json({
      success: true,
      message: 'Regeneration started',
      data: { assignmentId: id, status: 'pending' },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAssignmentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id)
      .select('status errorMessage jobId totalQuestions totalMarks')
      .lean();

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    res.json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
