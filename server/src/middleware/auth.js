const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const auth = async (req, res, next) => {
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured in environment');
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Authentication is not properly configured'
      });
    }

    console.log('Environment:', process.env.NODE_ENV);
    console.log('JWT_SECRET first 5 chars:', process.env.JWT_SECRET.substring(0, 5));
    console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);
    console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Log token details without exposing sensitive data
    const tokenParts = token.split('.');
    console.log('Token structure:', {
      length: token.length,
      prefix: token.substring(0, 10),
      parts: tokenParts.length,
      header: tokenParts[0] ? Buffer.from(tokenParts[0], 'base64').toString() : 'invalid',
      payloadLength: tokenParts[1] ? Buffer.from(tokenParts[1], 'base64').toString().length : 0
    });

    try {
      console.log('Attempting to verify token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully. User ID:', decoded.userId);
      console.log('Token payload:', {
        userId: decoded.userId,
        exp: new Date(decoded.exp * 1000).toISOString(),
        iat: new Date(decoded.iat * 1000).toISOString()
      });

      // Ensure database connection
      if (!mongoose.connection || mongoose.connection.readyState !== 1) {
        console.log('Database connection not ready, attempting to connect...');
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
      }

      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('User not found in database:', decoded.userId);
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'User not found'
        });
      }

      console.log('User found and authenticated:', user.email);
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', {
        error: jwtError.message,
        name: jwtError.name,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10),
        secretLength: process.env.JWT_SECRET.length,
        secretPrefix: process.env.JWT_SECRET.substring(0, 5),
        environment: process.env.NODE_ENV
      });
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token',
        details: jwtError.name
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during authentication'
    });
  }
};

module.exports = auth; 