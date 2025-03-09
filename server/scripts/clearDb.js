const mongoose = require('mongoose');
require('dotenv').config();

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Get all collections
    const collections = await mongoose.connection.db.collections();
    
    // Clear each collection
    for (let collection of collections) {
      console.log(`Clearing collection: ${collection.collectionName}`);
      await collection.deleteMany({});
      console.log(`Collection ${collection.collectionName} cleared`);
    }

    console.log('All collections have been cleared');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

// Run the script
clearDatabase(); 