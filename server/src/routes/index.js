const express = require('express');
const router = express.Router();
const medicineRoutes = require('./medicineRoutes');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// Mount routes
router.use('/medicines', medicineRoutes);

module.exports = router; 