import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, please sign in'
      });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded;
    next();

  } catch (e) {
    logger.error('Authentication failed', e);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};