const { sendDailyReminders } = require('../utils/notificationService');

// This endpoint will be called by Vercel Cron
export default async function handler(req, res) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing authorization token'
      });
    }

    console.log('Starting daily reminder job...');
    console.log('Current time:', new Date().toISOString());
    console.log('Timezone:', process.env.TIMEZONE);

    // Send reminders
    await sendDailyReminders();

    console.log('Daily reminder job completed successfully');
    res.status(200).json({
      status: 'success',
      message: 'Daily reminders sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in daily reminder job:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send daily reminders',
      error: error.message
    });
  }
} 