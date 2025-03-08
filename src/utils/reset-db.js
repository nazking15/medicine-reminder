require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

async function resetDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Clear existing records
    console.log('Clearing existing records...');
    await Medicine.deleteMany({});
    console.log('All existing records deleted\n');

    // Create a new test record with correct format
    const testMedicine = new Medicine({
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: [
        { time: "08:00", taken: false },
        { time: "20:00", taken: false }
      ],
      notes: "Take with food for better absorption",
      userId: "testuser123",
      notificationPreferences: {
        email: {
          enabled: true,
          address: process.env.TEST_EMAIL || "test@example.com",
          reminderTime: "08:00"
        }
      },
      active: true
    });

    console.log('Creating new test record...');
    const savedMedicine = await testMedicine.save();
    console.log('Test record created successfully!\n');

    // Display the new record
    console.log('New record details:');
    console.log('- Name:', savedMedicine.name);
    console.log('- Dosage:', savedMedicine.dosage);
    console.log('- Frequency:', savedMedicine.frequency.map(f => f.time).join(', '));
    console.log('- Notes:', savedMedicine.notes);
    console.log('- User ID:', savedMedicine.userId);
    console.log('- Notifications:', savedMedicine.notificationPreferences.email.enabled ? 'Enabled' : 'Disabled');
    console.log('- Created:', savedMedicine.createdAt);
    console.log('\nRaw document:');
    console.log(JSON.stringify(savedMedicine.toObject(), null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
resetDatabase(); 