import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * 📜 GET USER TRANSACTIONS
 */
router.get('/:referralId', async (req, res) => {
  try {
    if (!req.auth) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const transactions = await Transaction.find({
      userId: req.params.referralId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 💸 WITHDRAW APPROVE (ADMIN)
 */
router.post('/approve-withdraw/:id', async (req, res) => {
  try {
    if (!req.auth || req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const txn = await Transaction.findById(req.params.id);

    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (txn.status !== 'pending') {
      return res.status(400).json({ error: 'Already processed' });
    }

    const user = await User.findOne({ referralId: txn.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.wallet_balance < txn.amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // debit wallet
    user.wallet_balance -= txn.amount;
    user.totalWithdraw += txn.amount;

    await user.save();

    txn.status = "completed";
    await txn.save();

    res.json({
      success: true,
      message: "Withdraw approved"
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ❌ REJECT WITHDRAW
 */
router.post('/reject-withdraw/:id', async (req, res) => {
  try {
    if (!req.auth || req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const txn = await Transaction.findById(req.params.id);

    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    txn.status = "failed";
    await txn.save();

    res.json({
      success: true,
      message: "Withdraw rejected"
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;