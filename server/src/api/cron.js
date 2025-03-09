const { connectToDatabase } = require('../utils/db');
const { sendDailyReminders } = require('../utils/notificationService');

// This endpoint will be called by Vercel Cron
module.exports = async (req, res) => {
  console.log('Starting daily reminder job...');
  console.log('Current time:', new Date().toISOString());
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer medicine_reminder_cron_2024') {
    console.error('Unauthorized cron request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Send immediate response
  res.status(200).json({
    status: 'accepted',
    message: 'Daily reminder job started',
    timestamp: new Date().toISOString()
  });

  try {
    // Log environment variables (without sensitive values)
    console.log('\nEnvironment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('TIMEZONE:', process.env.TIMEZONE);
    console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
    console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
    console.log('DEEPSEEK_API_KEY set:', !!process.env.DEEPSEEK_API_KEY);

    // Connect to database
    console.log('\nConnecting to MongoDB...');
    await connectToDatabase();
    
    // Send reminders
    console.log('\nSending daily reminders...');
    await sendDailyReminders();
    console.log('Daily reminders sent successfully');

  } catch (error) {
    console.error('Error in daily reminder job:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}; 