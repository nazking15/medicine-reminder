require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { sendDailyReminders } = require('./utils/notificationService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  console.log('Creating new database connection');
  const db = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicine-reminder');
  cachedDb = db;
  console.log('Connected to MongoDB');
  return db;
}

// Connect to database before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
const medicineRoutes = require('./routes/medicineRoutes');
app.use('/api/medicines', medicineRoutes);

// Basic health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      mongodb: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// Only setup cron job if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  cron.schedule(process.env.REMINDER_TIME || '0 8 * * *', async () => {
    try {
      await connectToDatabase();
      await sendDailyReminders();
      console.log('Daily reminders sent successfully');
    } catch (error) {
      console.error('Error sending daily reminders:', error);
    }
  }, {
    timezone: process.env.TIMEZONE || "Asia/Singapore"
  });
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for serverless
module.exports = app; 