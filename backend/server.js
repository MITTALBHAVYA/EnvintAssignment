//server.js
import http from 'http';
import app from './app.js';
import dotenv from 'dotenv';
import mongoConnection from './config/databases/mongoconn.js';

dotenv.config(); 

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await mongoConnection();
    console.log("MongoDB connection has been established successfully");

    const server = http.createServer(app);

    server.listen(PORT,'0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Server running in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.log('Unable to start the server: ', error);
    process.exit(1);
  }
}
startServer();
