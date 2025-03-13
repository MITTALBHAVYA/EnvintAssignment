//mongoconn.js
import mongoose from "mongoose";
import logger from '../../utils/logger.js';

const mongoConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "envintFinance",
            serverSelectionTimeoutMS: 5000
        });
        logger.info("MongoDB connected successfully.");
    } catch (err) {
        logger.error(`MongoDB connection error: ${err}`);
        process.exit(1);
    }
};
export default mongoConnection;