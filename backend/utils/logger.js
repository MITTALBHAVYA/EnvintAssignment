//logger.js
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const logDir = path.join(process.cwd(), "logs");

// Winston transports
const transportConsole = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)
    )
});

const transportFile = new DailyRotateFile({
    filename: `${logDir}/application-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    maxSize: "10m",
    maxFiles: "14d", // Keep logs for 14 days
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    )
});

// Winston logger configuration
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [transportFile, transportConsole],
    exitOnError: false
});

// Log unhandled exceptions and rejections
logger.exceptions.handle(new winston.transports.File({ filename: `${logDir}/exceptions.log` }));
logger.rejections.handle(new winston.transports.File({ filename: `${logDir}/rejections.log` }));

export default logger;
