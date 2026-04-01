import express from 'express';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * 📧 SEND EMAIL
 */
router.post('/', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'to, subject, and body are required' });
    }

    // transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body
    });

    res.json({
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;