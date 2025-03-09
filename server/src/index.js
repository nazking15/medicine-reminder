require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { sendDailyReminders } = require('./utils/notificationService');

const app = express();

// Basic middleware
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    host: req.headers.host,
    body: req.method === 'GET' ? {} : req.body
  });
  next();
});

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins temporarily for debugging
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Pre-flight requests
app.options('*', (req, res) => {
  console.log('Handling OPTIONS request');
  res.sendStatus(200);
});

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  console.log('Creating new database connection');
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = db;
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Routes
const medicineRoutes = require('./routes/medicineRoutes');

// Middleware to ensure database connection before handling routes
app.use('/api/medicines', async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message
    });
  }
});

app.use('/api/medicines', medicineRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: req.headers
  });
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, async () => {
    try {
      await connectToDatabase();
      console.log(`Server is running on port ${PORT}`);
      
      // Schedule daily reminders
      cron.schedule(process.env.REMINDER_TIME || '0 8 * * *', async () => {
        try {
          await sendDailyReminders();
          console.log('Daily reminders sent successfully');
        } catch (error) {
          console.error('Error sending daily reminders:', error);
        }
      }, {
        timezone: process.env.TIMEZONE || "Asia/Singapore"
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });
}

// Export the Express app for serverless use
module.exports = app; 