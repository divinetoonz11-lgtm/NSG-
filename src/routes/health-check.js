import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  const timestamp = new Date().toISOString();
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp
  });
});

export default router;
