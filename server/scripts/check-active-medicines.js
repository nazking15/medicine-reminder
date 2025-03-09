require('dotenv').config({ path: '.env.prod' });
const mongoose = require('mongoose');
const Medicine = require('../src/models/Medicine');

async function checkActiveMedicines() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully\n');

    // Find all active medicines with notifications enabled
    const medicines = await Medicine.find({
      active: true,
      'notificationPreferences.email.enabled': true
    });

    console.log('Active medicines with notifications enabled:', medicines.length);
    
    if (medicines.length > 0) {
      medicines.forEach(medicine => {
        console.log('\nMedicine:', {
          name: medicine.name,
          dosage: medicine.dosage,
          email: medicine.notificationPreferences.email.address,
          reminderTime: medicine.notificationPreferences.email.reminderTime,
          frequency: medicine.frequency.map(f => f.time)
        });
      });
    } else {
      console.log('No active medicines found with notifications enabled');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

checkActiveMedicines(); 