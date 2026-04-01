import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './routes/index.js';
import { errorMiddleware, authMiddleware } from './middleware/index.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

const app = express();

// ========================
// 🔥 DATABASE CONNECT
// ========================
connectDB();

// ========================
// 🔥 GLOBAL ERROR HANDLING
// ========================
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
  logger.info('Interrupted');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received');
  await new Promise(resolve => setTimeout(resolve, 3000));
  logger.info('Exiting');
  process.exit();
});

// ========================
// 🔥 MIDDLEWARES
// ========================
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(morgan('combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// 🔐 AUTH MIDDLEWARE
// ========================
app.use(authMiddleware);

// ========================
// 🚀 ROUTES
// ========================
app.use('/', routes());

// ========================
// ❌ ERROR HANDLER
// ========================
app.use(errorMiddleware);

// ========================
// ❌ 404 HANDLER
// ========================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ========================
// 🚀 SERVER START
// ========================
const port = process.env.PORT || 5000;

app.listen(port, () => {
  logger.info(`API Server running on http://localhost:${port}`);
});

export default app;