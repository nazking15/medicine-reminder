require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

async function viewAllRecords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const medicines = await Medicine.find({}).lean();
    
    if (medicines.length === 0) {
      console.log('No records found in the database.');
    } else {
      console.log(`Found ${medicines.length} records:\n`);
      medicines.forEach((medicine, index) => {
        console.log(`Record ${index + 1}:`);
        console.log('- Name:', medicine.name || 'Not specified');
        console.log('- Dosage:', medicine.dosage || 'Not specified');
        
        // Safely handle frequency data
        if (Array.isArray(medicine.frequency)) {
          console.log('- Frequency:', medicine.frequency.map(f => `${f.time}${f.taken ? ' (taken)' : ''}`).join(', '));
        } else {
          console.log('- Frequency:', medicine.frequency || 'Not specified');
        }
        
        console.log('- User ID:', medicine.userId || 'Not specified');
        console.log('- Active:', medicine.active !== undefined ? medicine.active : 'Not specified');
        
        // Safely handle notification preferences
        const emailEnabled = medicine.notificationPreferences?.email?.enabled;
        const emailAddress = medicine.notificationPreferences?.email?.address;
        console.log('- Notifications:', emailEnabled ? `Enabled (${emailAddress})` : 'Disabled');
        
        // Format dates nicely
        const created = medicine.createdAt ? new Date(medicine.createdAt).toLocaleString() : 'Not specified';
        const updated = medicine.updatedAt ? new Date(medicine.updatedAt).toLocaleString() : 'Not specified';
        console.log('- Created:', created);
        console.log('- Updated:', updated);
        
        // Show the raw document for debugging
        console.log('\nRaw document:');
        console.log(JSON.stringify(medicine, null, 2));
        console.log('-------------------');
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
viewAllRecords(); 