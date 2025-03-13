import { Queue } from "bullmq";
import logger from "../utils/logger.js";  // Import Winston logger

export const financialQueue = new Queue("financialQueue", {
    connection: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: 6379
    },
    defaultJobOptions: {
        attempts: 3, 
        backoff: { type: "exponential", delay: 5000 } 
    }
});

financialQueue.on("waiting", (jobId) => {
    logger.info(`Job ${jobId} is waiting in the queue.`);
});

financialQueue.on("active", (job, jobPromise) => {
    logger.info(`Job ${job.id} started processing.`);
});

financialQueue.on("completed", (job, result) => {
    logger.info(`Job ${job.id} completed successfully with result: ${JSON.stringify(result)}`);
});

financialQueue.on("failed", (job, err) => {
    logger.error(`Job ${job.id} failed: ${err.message}`);
});

financialQueue.on("stalled", (job) => {
    logger.warn(`Job ${job.id} has stalled and may require manual intervention.`);
});

financialQueue.on("progress", (job, progress) => {
    logger.info(`Job ${job.id} is ${progress}% complete.`);
});
