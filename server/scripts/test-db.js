require('dotenv').config({ path: '.env.prod' });
const { connectToDatabase } = require('../src/utils/db');
const mongoose = require('mongoose');

async function testDatabaseConnection() {
  try {
    console.log('\nTesting database connection...');
    
    // Log environment
    console.log('\nEnvironment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI type:', typeof process.env.MONGODB_URI);
    console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length);
    
    // Test connection
    console.log('\nAttempting connection...');
    await connectToDatabase();
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log('-', collection.name);
    });
    
    // Test a simple query
    const Medicine = require('../src/models/Medicine');
    const medicines = await Medicine.find({ active: true }).lean();
    console.log('\nActive medicines:', medicines.length);
    medicines.forEach(med => {
      console.log('-', med.name);
    });

  } catch (error) {
    console.error('\nError in test:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
      stack: error.stack
    });
  } finally {
    if (mongoose.connection) {
      try {
        await mongoose.connection.close();
        console.log('\nClosed MongoDB connection');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
    }
  }
}

testDatabaseConnection(); 