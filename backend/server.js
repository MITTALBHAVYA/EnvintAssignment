//server.js
import http from 'http';
import app from './app.js';
import dotenv from 'dotenv';
import mongoConnection from './config/databases/mongoconn.js';
import logger from './utils/logger.js';

dotenv.config(); 

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await mongoConnection();
    logger.info("MongoDB connection has been established successfully");

    const server = http.createServer(app);

    server.listen(PORT,'0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Server running in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Unable to start the server: ', error);
    process.exit(1);
  }
}
startServer();
