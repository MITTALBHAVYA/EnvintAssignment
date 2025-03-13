import { Queue } from "bullmq";

export const financialQueue = new Queue("financialQueue", {
    connection: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: 6379
    }
});

financialQueue.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
});

financialQueue.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
});
