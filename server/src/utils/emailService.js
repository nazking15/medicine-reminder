const nodemailer = require('nodemailer');
const Medicine = require('../models/Medicine');

// Array of positive messages
const positiveMessages = [
  "Every day is a new beginning. Take your medicines and embrace the day with hope!",
  "Your health is your wealth. Keep going strong!",
  "Small steps lead to big changes. You're doing great!",
  "Taking care of yourself is an act of self-love. Keep it up!",
  "You're making positive choices for your health. That's something to be proud of!",
  "Each pill is a step towards better health. You've got this!",
  "Your dedication to your health is inspiring. Keep shining!",
  "Today is going to be amazing, just like you!",
  "Remember: you are stronger than you think!",
  "Your well-being matters. Take good care of yourself today!"
];

// Create reusable transporter object using environment variables
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false
  }
});

const getRandomPositiveMessage = () => {
  return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
};

const formatMedicineList = (medicines) => {
  return medicines.map(medicine => {
    const times = medicine.frequency.map(f => f.time).join(', ');
    return `- ${medicine.name} (${medicine.dosage}) at: ${times}`;
  }).join('\n');
};

const sendDailyReminders = async () => {
  try {
    // Verify SMTP connection configuration
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // For testing: if no medicines in DB, use test data
    let medicines = await Medicine.find({ active: true });
    
    if (medicines.length === 0) {
      console.log('No medicines found in DB, using test data...');
      medicines = [{
        name: "Test Vitamin C",
        dosage: "500mg",
        frequency: [
          { time: "09:00", taken: false },
          { time: "21:00", taken: false }
        ],
        userId: process.env.EMAIL_USER // Send test email to configured email
      }];
    }
    
    // Group medicines by userId
    const userMedicines = {};
    medicines.forEach(medicine => {
      if (!userMedicines[medicine.userId]) {
        userMedicines[medicine.userId] = [];
      }
      userMedicines[medicine.userId].push(medicine);
    });

    // Send email for each user
    for (const [userId, userMeds] of Object.entries(userMedicines)) {
      const positiveMessage = getRandomPositiveMessage();
      const medicineList = formatMedicineList(userMeds);

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: userId,
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
      };

      // Send mail with defined transport object
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
    throw error;
  }
};

module.exports = {
  sendDailyReminders
}; 