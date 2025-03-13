//financialController.js
import { financialQueue } from "../workers/financialQueue.js";
import FinancialData from "../models/financialModel.js";
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../middleware/errorHandler.js';
import redis from '../config/databases/redis.js';

export const uploadFinancialData = catchAsyncErrors(async (req, res, next) => {
    const { data } = req.body;
    const user_id = req.user._id;

    logger.info(`Financial data upload initiated by User ID: ${user_id}`);

    if (!Array.isArray(data) || data.length > 500) {
        logger.warn(`Upload failed: Too many records (${data.length}) by User ID: ${user_id}`);
        return next(new ErrorHandler("Max 500 records allowed per request.", 400));
    }

    const jobs = data.map(record => ({
        name: record.company_id,
        data: { ...record, user_id }
    }));
    try {
        await financialQueue.addBulk(jobs);
        logger.info(`Financial data queued for processing (User ID: ${user_id}, Records: ${data.length})`);

        res.status(200).json({
            success: true,
            message: "Data processing started."
        });
    } catch (error) {
        logger.error(`Error queuing financial data for User ID: ${user_id} - ${error.message}`);
        return next(new ErrorHandler("Failed to queue financial data", 500));
    }
});


export const getRiskAssessment = catchAsyncErrors(async (req, res, next) => {
    const { company_id, reporting_period, industry_sector } = req.query;
    const cacheKey = `risk:${company_id || "all"}:${reporting_period || "all"}:${industry_sector || "all"}`;

    logger.info(`Risk assessment request received - Filters: company_id=${company_id}, reporting_period=${reporting_period}, industry_sector=${industry_sector}`);

    try {
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            return res.status(200).json({
                success: true,
                cached: true,
                data: JSON.parse(cachedData)
            });
        }

        const query = {};
        if (company_id) query.company_id = company_id;
        if (reporting_period) query.reporting_period = reporting_period;
        if (industry_sector) query.industry_sector = industry_sector;

        const data = await FinancialData.find(query).limit(50);
        if (!data || data.length === 0) {
            return next(new ErrorHandler("No data found.", 404));
        }
        await redis.set(cacheKey, JSON.stringify(data), 'EX', 300);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        logger.error(`Error fetching risk assessment data - ${error.message}`);
        return next(new ErrorHandler("Failed to fetch risk assessment data", 500));
    }
});

export const testUpload = catchAsyncErrors(async (req, res, next) => {
    const { data } = req.body;
    const user_id = req.user._id;

    const enrichedData = data.map(entry => ({
        ...entry,
        user_id
    }));

    const companyData = await FinancialData.insertMany(enrichedData);

    res.status(200).json({
        success: true,
        message: "Data uploaded successfully",
        data: companyData
    });
});
