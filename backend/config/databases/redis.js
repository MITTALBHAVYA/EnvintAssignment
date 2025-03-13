//redis.js
import Redis from 'ioredis';
const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: 6379
});

redis.on("connect", () => { // Use 'on' instead of 'io'
    console.log("Redis connected successfully.");
});

redis.on("error", (err) => {
    console.log(`Redis connection error: ${err}`);
});

export default redis;
