import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * 💰 GET WALLET
 */
router.get('/:referralId', async (req, res) => {
  try {
    if (!req.auth) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ referralId: req.params.referralId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        balance: user.wallet_balance,
        totalIncome: user.totalIncome,
        totalWithdraw: user.totalWithdraw
      }
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 💸 WITHDRAW REQUEST
 */
router.post('/withdraw', async (req, res) => {
  try {
    if (!req.auth) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { referralId, amount } = req.body;

    const user = await User.findOne({ referralId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.wallet_balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // create pending transaction
    await Transaction.create({
      userId: referralId,
      amount,
      type: "withdraw",
      status: "pending"
    });

    res.json({ success: true, message: "Withdraw request submitted" });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🛠 ADMIN FUND ADD (MARKETING / BONUS)
 */
router.post('/admin/add-fund', async (req, res) => {
  try {
    if (!req.auth || req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { referralId, amount, remark } = req.body;

    const user = await User.findOne({ referralId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // wallet update
    user.wallet_balance += amount;
    await user.save();

    // transaction
    await Transaction.create({
      userId: referralId,
      amount,
      type: "credit",
      source: "admin",
      remark
    });

    res.json({ success: true });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;