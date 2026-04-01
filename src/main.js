import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/index.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

const app = express();

// ========================
// MIDDLEWARES
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
// Health Check Route
// ========================
app.get('/', (req, res) => res.send('API is running 🚀'));

// ========================
// Routes (authMiddleware only on protected routes)
// ========================
app.use('/api', routes());

// ========================
// Error Handler
// ========================
app.use(errorMiddleware);

// ========================
// 404 Handler
// ========================
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ========================
// Async Server Start
// ========================
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB before starting
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      logger.info(`API Server running on port ${port}`);
    });
  } catch (error) {
    logger.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();

export default app;