const express = require('express');
const router = express.Router();
const medicineRoutes = require('./medicineRoutes');
const { connectToDatabase } = require('../utils/db');
const mongoose = require('mongoose');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await connectToDatabase();
    
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      environment: process.env.NODE_ENV,
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        name: mongoose.connection.db?.databaseName
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error',
      error: error.message,
      details: {
        name: error.name,
        code: error.code
      }
    });
  }
});

// Mount routes
router.use('/medicines', medicineRoutes);

module.exports = router; 