const { Resend } = require('resend');
const Medicine = require('../models/Medicine');
const { generatePositiveMessage } = require('./deepseekService');

const resend = new Resend(process.env.RESEND_API_KEY);

const formatMedicineList = (medicines) => {
  return medicines.map(medicine => {
    const times = medicine.frequency.map(f => f.time).join(', ');
    return `- ${medicine.name} (${medicine.dosage}) at: ${times}`;
  }).join('\n');
};

const sendEmailReminder = async (email, medicines) => {
  try {
    console.log('\nPreparing email for:', email);
    console.log('Medicines to include:', medicines.map(m => m.name));

    // Generate a personalized message using Deepseek
    const context = {
      name: email.split('@')[0], // Use the part before @ as name
      medicineName: medicines[0]?.name // Use the first medicine name if available
    };
    console.log('Generating message with context:', context);
    
    const positiveMessage = await generatePositiveMessage(context);
    console.log('Generated message:', positiveMessage);
    
    const medicineList = formatMedicineList(medicines);
    console.log('Formatted medicine list:', medicineList);

    console.log('Sending email via Resend...');
    console.log('Resend API Key length:', process.env.RESEND_API_KEY?.length || 0);

    const data = await resend.emails.send({
      from: 'Medicine Reminder <onboarding@resend.dev>',
      to: email,
      subject: '🌟 Your Daily Medicine Reminder & Positive Message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Good Morning! 🌞</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #27ae60;">Today's Positive Message:</h3>
            <p style="font-size: 18px; color: #2c3e50; font-style: italic;">${positiveMessage}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #2c3e50;">Your Medicines for Today:</h3>
            <pre style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${medicineList}</pre>
          </div>

          <p style="color: #7f8c8d;">Remember to take your medicines as prescribed. Have a wonderful day!</p>
          
          <div style="font-size: 12px; color: #95a5a6; margin-top: 30px; text-align: center;">
            This is an automated reminder from your Medicine Reminder App.
          </div>
        </div>
      `
    });

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

const sendDailyReminders = async () => {
  try {
    console.log('\nStarting daily reminders process...');
    
    // Get all active medicines with enabled email notifications
    const medicines = await Medicine.find({
      active: true,
      'notificationPreferences.email.enabled': true
    });

    console.log(`Found ${medicines.length} active medicines with notifications enabled`);

    // Group medicines by email address
    const emailGroups = {};
    medicines.forEach(medicine => {
      const email = medicine.notificationPreferences.email.address;
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push(medicine);
    });

    console.log(`Grouped medicines for ${Object.keys(emailGroups).length} unique email addresses`);

    // Send emails for each group
    for (const [email, userMeds] of Object.entries(emailGroups)) {
      console.log(`\nProcessing email group for: ${email}`);
      console.log(`Medicines in group: ${userMeds.map(m => m.name).join(', ')}`);
      
      try {
        await sendEmailReminder(email, userMeds);
        console.log(`Successfully sent reminder to ${email}`);
      } catch (error) {
        console.error(`Failed to send reminder to ${email}:`, error);
        // Continue with next email even if one fails
      }
    }

    console.log('\nAll daily reminders processed');
  } catch (error) {
    console.error('Error in sendDailyReminders:', error);
    throw error;
  }
};

module.exports = {
  sendDailyReminders,
  sendEmailReminder
}; 