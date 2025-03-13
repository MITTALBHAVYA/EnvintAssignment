//redis.js
import Redis from 'ioredis';
import logger from '../../utils/logger.js';

const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: 6379
});

redis.on("connect", () => { // Use 'on' instead of 'io'
    logger.info("Redis connected successfully.");
});

redis.on("error", (err) => {
    logger.error(`Redis connection error: ${err}`);
});

export default redis;
