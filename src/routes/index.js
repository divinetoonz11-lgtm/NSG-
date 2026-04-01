import express from 'express';
import healthCheckRouter from './health-check.js';
import authRouter from './auth.js';
import dashboardRouter from './dashboard.js';
import emailRouter from './email.js';
import setupRouter from './setup.js';
import usersRouter from './users.js';
import walletsRouter from './wallets.js';
import incomeRouter from './income.js';
import transactionsRouter from './transactions.js';

export default function routes() {
  const router = express.Router();

  // Health check endpoint
  router.use('/health', healthCheckRouter);

  // Auth endpoints
  router.use('/auth', authRouter);

  // Dashboard endpoints
  router.use('/admin', dashboardRouter);
  router.use('/customer', dashboardRouter);
  router.use('/associate', dashboardRouter);

  // Email endpoint
  router.use('/email', emailRouter);

  // Setup endpoint
  router.use('/setup', setupRouter);

  // Users endpoints
  router.use('/users', usersRouter);

  // Wallets endpoints
  router.use('/wallets', walletsRouter);

  // Income endpoints
  router.use('/income', incomeRouter);

  // Transactions endpoints
  router.use('/transactions', transactionsRouter);

  return router;
}
