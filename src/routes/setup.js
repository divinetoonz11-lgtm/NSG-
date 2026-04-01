import express from 'express';

const router = express.Router();

/**
 * Setup route (not needed for MongoDB)
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Setup not required (MongoDB auto handles collections)'
  });
});

export default router;