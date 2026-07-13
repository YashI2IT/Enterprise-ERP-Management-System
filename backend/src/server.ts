import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';
import logger from './config/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Handle Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle Unhandled Rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! Shutting down...');
    logger.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
