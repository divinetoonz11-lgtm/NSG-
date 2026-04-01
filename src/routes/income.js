import express from 'express';
import Income from '../models/Income.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET INCOME SUMMARY
 */
router.get('/:referralId', async (req, res) => {
  try {
    if (!req.auth) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const incomes = await Income.find({ userId: req.params.referralId });

    let summary = {
      total: 0,
      direct: 0,
      binary: 0,
      level: 0,
      roi: 0,
      royalty: 0
    };

    incomes.forEach(i => {
      summary.total += i.amount;

      if (i.type === "direct") summary.direct += i.amount;
      if (i.type === "binary") summary.binary += i.amount;
      if (i.type === "level") summary.level += i.amount;
      if (i.type === "roi") summary.roi += i.amount;
      if (i.type === "royalty") summary.royalty += i.amount;
    });

    res.json({ success: true, data: summary });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET INCOME HISTORY
 */
router.get('/:referralId/history', async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.params.referralId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: incomes });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;