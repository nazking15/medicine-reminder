const mongoose = require('mongoose');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  console.log('Creating new database connection');
  try {
    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Configure connection options for MongoDB Atlas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority'
    };

    console.log('Connecting with URI:', process.env.MONGODB_URI?.split('@')[0].replace(/:[^:]+@/, ':****@'));
    const db = await mongoose.connect(process.env.MONGODB_URI, options);
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('Connected to MongoDB - Database:', mongoose.connection.db.databaseName);
    
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    throw error;
  }
}

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
  cachedDb = null;
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = {
  connectToDatabase
}; 