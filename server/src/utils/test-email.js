require('dotenv').config();
const { sendEmailReminder } = require('./notificationService');

async function testEmail() {
  try {
    console.log('Testing email service...');
    
    // Test data
    const testMedicines = [{
      name: "Test Vitamin C",
      dosage: "500mg",
      frequency: [
        { time: "09:00", taken: false },
        { time: "21:00", taken: false }
      ]
    }];

    // Using the email address associated with your Resend account
    const testEmail = "nawaz.imam@gmail.com";

    console.log(`Sending test email to: ${testEmail}`);
    await sendEmailReminder(testEmail, testMedicines);
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEmail(); 