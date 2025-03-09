require('dotenv').config({ path: '.env.prod' });
const mongoose = require('mongoose');
const { sendDailyReminders } = require('../src/utils/notificationService');

async function testFullFlow() {
  let connection = null;
  try {
    console.log('\nTesting full notification flow...');
    
    // Log environment
    console.log('\nEnvironment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
    console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
    console.log('DEEPSEEK_API_KEY set:', !!process.env.DEEPSEEK_API_KEY);
    console.log('TIMEZONE:', process.env.TIMEZONE);

    // Connect to MongoDB
    console.log('\nConnecting to MongoDB...');
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Run daily reminders
    console.log('\nStarting daily reminders process...');
    await sendDailyReminders();
    console.log('\nDaily reminders completed');

  } catch (error) {
    console.error('\nError in test:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } finally {
    if (connection) {
      try {
        await connection.disconnect();
        console.log('\nClosed MongoDB connection');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
    }
  }
}

testFullFlow(); 