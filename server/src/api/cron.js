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

    console.log('Starting daily reminder job...');
    console.log('Current time:', new Date().toISOString());
    console.log('Timezone:', process.env.TIMEZONE);

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    mongoConnection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Send reminders
    await sendDailyReminders();
    console.log('Daily reminder job completed successfully');

  } catch (error) {
    console.error('Error in daily reminder job:', error);
    // We can't send response here as it's already been sent
  } finally {
    // Close MongoDB connection
    if (mongoConnection) {
      await mongoConnection.disconnect();
      console.log('Closed MongoDB connection');
    }
  }
} 