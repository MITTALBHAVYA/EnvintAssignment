//financialWorker.js
import { Worker } from "bullmq";
import FinancialData from "../models/financialModel.js";
import mongoConnection from "../config/databases/mongoconn.js";
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const financialWorker = new Worker(
    "financialQueue",
    async (job) => {
        await mongoConnection();
        try {
            logger.info(`Processing job ${job.id} with data:`, job.data);
            await FinancialData.create(job.data);
            return { success: true };
        } catch (err) {
            logger.error(`Error processing job ${job.id}: ${err.message}`);
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
    logger.info(`Worker: Job ${job.id} completed with result:`, result);
});

financialWorker.on("failed", (job, err) => {
    logger.error(`Worker: Job ${job.id} failed: ${err.message}`);
});
