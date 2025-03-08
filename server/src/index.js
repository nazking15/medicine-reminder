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

// Health check endpoint (before routes and DB connection)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1} of ${retries}`);
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Connected to MongoDB');
      return true;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
    }
  }
  return false;
};

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

// Initialize routes only after DB connection
const initializeRoutes = () => {
  const medicineRoutes = require('./routes/medicineRoutes');
  app.use('/api/medicines', medicineRoutes);

  // Handle 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
  });
};

// Start server function
const startServer = async (port) => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Initialize routes after successful DB connection
    initializeRoutes();

    // Start the server
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Schedule daily reminders
    if (process.env.NODE_ENV !== 'development') {
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
    }

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
};

// Start the server
const PORT = process.env.PORT || 3000;
startServer(PORT).catch(err => {
  console.error('Server startup failed:', err);
  process.exit(1);
}); 