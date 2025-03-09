const mongoose = require('mongoose');
const { sendDailyReminders } = require('../utils/notificationService');

// This endpoint will be called by Vercel Cron
module.exports = async function handler(req, res) {
  let mongoConnection = null;
  
  try {
    // Verify the request is from Vercel Cron
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing authorization token'
      });
    }

    // Send response immediately to prevent timeout
    res.status(200).json({
      status: 'accepted',
      message: 'Daily reminder job started',
      timestamp: new Date().toISOString()
    });

    // Log environment variables (without exposing sensitive values)
    console.log('\nEnvironment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('TIMEZONE:', process.env.TIMEZONE);
    console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
    console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
    console.log('DEEPSEEK_API_KEY set:', !!process.env.DEEPSEEK_API_KEY);
    
    console.log('\nStarting daily reminder job...');
    console.log('Current time:', new Date().toISOString());

    // Connect to MongoDB
    console.log('\nConnecting to MongoDB...');
    mongoConnection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Send reminders
    await sendDailyReminders();
    console.log('\nDaily reminder job completed successfully');

  } catch (error) {
    console.error('\nError in daily reminder job:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } finally {
    // Close MongoDB connection
    if (mongoConnection) {
      try {
        await mongoConnection.disconnect();
        console.log('\nClosed MongoDB connection');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
    }
  }
} 