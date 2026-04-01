import express from 'express';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET ALL USERS (ADMIN)
 */
router.get('/', async (req, res) => {
  try {
    if (!req.auth || req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const users = await User.find().sort({ createdAt: -1 });

    res.json({ success: true, data: users });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET USER PROFILE (by referralId)
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

    res.json({ success: true, data: user });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET DIRECT TEAM
 */
router.get('/team/:referralId', async (req, res) => {
  try {
    const users = await User.find({ sponsorId: req.params.referralId });

    res.json({ success: true, data: users });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;