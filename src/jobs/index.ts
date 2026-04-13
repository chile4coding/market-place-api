import { Queue, Worker, Job } from 'bullmq';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';

export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  NOTIFICATION: 'notification-queue',
  IMAGE: 'image-queue',
  ORDER: 'order-queue',
  ANALYTICS: 'analytics-queue',
} as const;

export interface EmailJobData {
  type: 'welcome' | 'verification' | 'password-reset' | 'order-confirmation' | 'mfa-token';
  to: string;
  data: Record<string, unknown>;
}

export const emailQueue = new Queue<EmailJobData>(QUEUE_NAMES.EMAIL, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 100,
    },
  },
});

export const addEmailJob = async (data: EmailJobData) => {
  return emailQueue.add(data.type, data, {
    priority: data.type === 'verification' ? 1 : 2,
  });
};

let emailWorker: Worker | null = null;

export const startEmailWorker = (processFn: (data: EmailJobData) => Promise<void>) => {
  if (emailWorker) {
    return emailWorker;
  }

  emailWorker = new Worker<EmailJobData>(
    QUEUE_NAMES.EMAIL,
    async (job: Job<EmailJobData>) => {
      logger.info(`Processing email job: ${job.id} - ${job.data.type}`);
      await processFn(job.data);
      logger.info(`Email job completed: ${job.id}`);
    },
    {
      connection: redis,
      concurrency: 5,
    },
  );

  emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed:`, err);
  });

  return emailWorker;
};

export const closeAllQueues = async () => {
  await emailQueue.close();
  logger.info('All queues closed');
};
