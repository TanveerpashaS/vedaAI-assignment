import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis';

let assessmentQueue: Queue | null = null;

export const getAssessmentQueue = (): Queue => {
  if (!assessmentQueue) {
    assessmentQueue = new Queue('assessment-generation', {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return assessmentQueue;
};

export interface AssessmentJobData {
  assignmentId: string;
  title: string;
  subject: string;
  className: string;
  questionTypes: Array<{ type: string; count: number; marks: number }>;
  additionalInstructions: string;
  fileContent?: string;
}
