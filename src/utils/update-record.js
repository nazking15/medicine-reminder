require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

async function updateRecord() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Update allopurinol record
    const updatedMedicine = await Medicine.findOneAndUpdate(
      { name: "allopurinol" },
      {
        $set: {
          frequency: [
            { time: "09:00", taken: false },
            { time: "21:00", taken: false }
          ],
          notificationPreferences: {
            email: {
              enabled: true,
              address: process.env.TEST_EMAIL,
              reminderTime: "09:00"
            }
          }
        }
      },
      { new: true }
    );

    if (updatedMedicine) {
      console.log('Record updated successfully!\n');
      console.log('Updated record details:');
      console.log('- Name:', updatedMedicine.name);
      console.log('- Dosage:', updatedMedicine.dosage);
      console.log('- Frequency:', updatedMedicine.frequency.map(f => f.time).join(', '));
      console.log('- Notes:', updatedMedicine.notes);
      console.log('- User ID:', updatedMedicine.userId);
      console.log('- Notifications:', updatedMedicine.notificationPreferences.email.enabled ? 'Enabled' : 'Disabled');
      console.log('\nRaw document:');
      console.log(JSON.stringify(updatedMedicine.toObject(), null, 2));
    } else {
      console.log('Record not found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
updateRecord(); 