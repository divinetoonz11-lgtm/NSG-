import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.auth = decoded;

    next();

  } catch (error) {
    logger.error('Auth middleware error:', error);
    next();
  }
};

export default authMiddleware;