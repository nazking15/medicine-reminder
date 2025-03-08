require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const { sendDailyReminders, sendImmediateReminder } = require('./emailService');

async function testNotifications() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all medicines
    const medicines = await Medicine.find({}).lean();
    
    // Test immediate reminders for each medicine
    for (const medicine of medicines) {
      console.log(`Testing notification for ${medicine.name}...`);
      
      try {
        await sendImmediateReminder(
          medicine.notificationPreferences.email.address,
          [medicine]
        );
        console.log(`✅ Immediate reminder sent successfully for ${medicine.name}\n`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for ${medicine.name}:`, error.message);
      }
    }

    // Test daily reminders
    console.log('\nTesting daily reminders...');
    try {
      await sendDailyReminders();
      console.log('✅ Daily reminders sent successfully');
    } catch (error) {
      console.error('❌ Failed to send daily reminders:', error.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
testNotifications(); 