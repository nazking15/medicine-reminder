require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { sendDailyReminders } = require('./utils/notificationService');
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const auth = require('./middleware/auth');

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
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001'] 
    : process.env.CLIENT_URL || 'https://medicine-reminder-hhaq.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Pre-flight requests
app.options('*', (req, res) => {
  console.log('Handling OPTIONS request from:', req.headers.origin);
  res.sendStatus(200);
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'healthy', message: 'Server is running and database is connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Auth routes (unprotected)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/medicines', auth, medicineRoutes);

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

// Schedule daily reminders
const reminderSchedule = process.env.REMINDER_SCHEDULE || '0 8 * * *'; // Default to 8 AM
cron.schedule(reminderSchedule, async () => {
  try {
    console.log('Running scheduled medicine reminders...');
    await sendDailyReminders();
    console.log('Daily reminders sent successfully');
  } catch (error) {
    console.error('Error sending daily reminders:', error);
  }
}, {
  timezone: process.env.TIMEZONE || 'UTC'
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Export the Express app for serverless use
module.exports = app; 