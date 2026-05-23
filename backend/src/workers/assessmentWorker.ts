import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { generateAssessment } from '../services/aiService';
import { emitProgress } from '../socket/socketManager';
import { AssessmentJobData } from '../queues/assessmentQueue';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const processAssessmentJob = async (job: Job<AssessmentJobData>): Promise<void> => {
  const { assignmentId } = job.data;
  
  console.log(`🔄 Processing job ${job.id} for assignment ${assignmentId}`);

  try {
    // Update status to processing
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
    
    emitProgress(assignmentId, 10, 'Starting AI generation...', 'processing');
    await job.updateProgress(10);

    emitProgress(assignmentId, 25, 'Analyzing assignment requirements...', 'processing');
    await job.updateProgress(25);

    emitProgress(assignmentId, 40, 'Generating questions with AI...', 'processing');
    await job.updateProgress(40);

    // Generate the assessment
    const generatedPaper = await generateAssessment(job.data);

    emitProgress(assignmentId, 70, 'Structuring question paper...', 'processing');
    await job.updateProgress(70);

    emitProgress(assignmentId, 85, 'Saving to database...', 'processing');
    await job.updateProgress(85);

    // Save to MongoDB
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'completed',
      generatedPaper,
    });

    emitProgress(assignmentId, 100, 'Question paper ready!', 'completed');
    await job.updateProgress(100);

    console.log(`✅ Job ${job.id} completed for assignment ${assignmentId}`);
  } catch (error: any) {
    console.error(`❌ Job ${job.id} failed:`, error.message);

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'failed',
      errorMessage: error.message,
    });

    emitProgress(assignmentId, 0, `Generation failed: ${error.message}`, 'failed');
    throw error;
  }
};

export const startWorker = async (): Promise<void> => {
  await connectDatabase();

  const worker = new Worker<AssessmentJobData>(
    'assessment-generation',
    processAssessmentJob,
    {
      connection: getRedisClient(),
      concurrency: 3,
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Worker completed job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Worker failed job ${job?.id}:`, err.message);
  });

  worker.on('progress', (job, progress) => {
    console.log(`📊 Job ${job.id} progress: ${progress}%`);
  });

  console.log('🚀 Assessment worker started');
};

// Start worker if run directly
if (require.main === module) {
  startWorker().catch(console.error);
}
