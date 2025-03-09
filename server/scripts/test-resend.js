require('dotenv').config({ path: '.env.prod' });
const { Resend } = require('resend');

async function testResend() {
  try {
    console.log('Testing Resend API...');
    console.log('API Key length:', process.env.RESEND_API_KEY?.length || 0);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'Medicine Reminder <onboarding@resend.dev>',
      to: 'nawaz.imam@gmail.com',
      subject: 'Test Email from Medicine Reminder',
      html: '<p>This is a test email to verify the Resend API is working correctly.</p>'
    });

    console.log('Test email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send test email:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

testResend(); 