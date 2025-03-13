import { Worker } from "bullmq";
import FinancialData from "../models/financialModel.js";
import mongoConnection from "../config/databases/mongoconn.js";
import dotenv from 'dotenv';

dotenv.config();

const financialWorker = new Worker(
    "financialQueue",
    async (job) => {
        await mongoConnection();
        try {
            console.log(`Processing job ${job.id} with data:`, job.data);
            await FinancialData.create(job.data);
            return { success: true };
        } catch (err) {
            console.error(`Error processing job ${job.id}: ${err.message}`);
            throw new Error(`Error processing financial data: ${err.message}`);
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: 6379
        }
    }
);

financialWorker.on("completed", (job, result) => {
    console.log(`Worker: Job ${job.id} completed with result:`, result);
});

financialWorker.on("failed", (job, err) => {
    console.error(`Worker: Job ${job.id} failed: ${err.message}`);
});
