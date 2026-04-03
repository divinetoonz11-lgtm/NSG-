import express from 'express';
import User from '../models/User.js';
import Income from '../models/Income.js';
import Transaction from '../models/Transaction.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * 📊 ADMIN DASHBOARD (PRO VERSION)
 */
router.get('/dashboard', async (req, res) => {
  try {
    if (!req.auth || req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // 🔥 TOTAL USERS
    const totalUsers = await User.countDocuments();

    // 🔥 ACTIVE / INACTIVE
    const activeUsers = await User.countDocuments({ activation_status: "active" });
    const inactiveUsers = await User.countDocuments({ activation_status: "inactive" });

    // 🔥 TOTAL INCOME
    const totalIncomeData = await Income.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 🔥 TODAY INCOME
    const today = new Date();
    today.setHours(0,0,0,0);

    const todayIncomeData = await Income.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 🔥 TOTAL WITHDRAW
    const totalWithdrawData = await Transaction.aggregate([
      { $match: { type: "withdraw", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 🔥 WALLET BALANCE (ALL USERS)
    const walletData = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$wallet_balance" } } }
    ]);

    const totalIncome = totalIncomeData[0]?.total || 0;
    const todayIncome = todayIncomeData[0]?.total || 0;
    const totalWithdraw = totalWithdrawData[0]?.total || 0;
    const totalWallet = walletData[0]?.total || 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers
        },
        income: {
          total: totalIncome,
          today: todayIncome
        },
        withdraw: totalWithdraw,
        wallet: totalWallet
      }
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;