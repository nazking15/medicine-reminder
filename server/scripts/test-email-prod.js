require('dotenv').config({ path: '.env.prod' });
const { Resend } = require('resend');
const mongoose = require('mongoose');
const Medicine = require('../src/models/Medicine');
const { sendEmailReminder } = require('../src/utils/notificationService');

async function testEmailInProduction() {
  try {
    console.log('Testing email service in production...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not set');
    console.log('Resend API Key:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set');

    // Connect to MongoDB
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Create a test medicine
    const testMedicine = new Medicine({
      name: "Test Medicine",
      dosage: "100mg",
      frequency: [
        { time: "09:00", taken: false },
        { time: "21:00", taken: false }
      ],
      userId: "test-user",
      notificationPreferences: {
        email: {
          enabled: true,
          address: "nawaz.imam@gmail.com", // Your email for testing
          reminderTime: "09:00"
        }
      },
      active: true
    });

    // Save test medicine
    console.log('\nSaving test medicine...');
    await testMedicine.save();
    console.log('Test medicine saved successfully');

    // Send test email
    console.log('\nSending test email...');
    await sendEmailReminder(testMedicine.notificationPreferences.email.address, [testMedicine]);
    console.log('✅ Test email sent successfully!');

    // Clean up test data
    console.log('\nCleaning up test data...');
    await Medicine.deleteOne({ _id: testMedicine._id });
    console.log('Test data cleaned up successfully');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the test
testEmailInProduction(); 