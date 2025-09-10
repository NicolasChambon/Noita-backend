import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import {
  globalErrorHandler,
  notFoundHandler,
} from './utils/errors/AppError.js';
import router from './routers/indexRouter.js';

const app = express();

// Health check endpoint (loaded immediately for Cloud Run)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Configure middleware synchronously for faster startup
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));
app.use(cors(config.cors));

// Load routes
app.use(router);
console.log('Routes loaded successfully');

// Global error handling middleware
app.use(globalErrorHandler);

// 404 handler
app.use(notFoundHandler);

const PORT = config.port;

// Graceful shutdown handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown for Cloud Run
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed');

    try {
      // Close database connections
      const { getDatabase } = await import('./config/database.js');
      const sequelize = await getDatabase();
      await sequelize.close();
      console.log('Database connections closed');
    } catch (error) {
      console.error('Error closing database connections:', error);
    }

    console.log('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export default app;
