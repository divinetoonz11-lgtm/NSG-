import express from 'express';
import User from '../models/User.js';
import Income from '../models/Income.js';
import Transaction from '../models/Transaction.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * 📊 ADMIN DASHBOARD
 */
router.get('/dashboard', async (req, res) => {
  try {
    if (!req.auth || req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const totalUsers = await User.countDocuments();

    const totalIncomeData = await Income.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalWithdrawData = await Transaction.aggregate([
      { $match: { type: "withdraw", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalIncome = totalIncomeData[0]?.total || 0;
    const totalWithdraw = totalWithdrawData[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalIncome,
        totalWithdraw
      }
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;