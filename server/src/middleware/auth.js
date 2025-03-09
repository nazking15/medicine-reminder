const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Authentication is not properly configured'
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'User not found'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', {
        error: jwtError.message,
        token: token.substring(0, 10) + '...' // Log only first 10 chars for security
      });
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during authentication'
    });
  }
};

module.exports = auth; 