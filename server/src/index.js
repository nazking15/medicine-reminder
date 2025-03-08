require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { sendDailyReminders } = require('./utils/notificationService');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://medicine-reminder-hhaq.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicine-reminder')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const medicineRoutes = require('./routes/medicineRoutes');
app.use('/api/medicines', medicineRoutes);

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

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

const PORT = process.env.PORT || 3000;
let server;

// Function to cleanup server
const cleanup = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });

    // Force close if graceful shutdown fails
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 1000);
  }
};

// Function to start server
const startServer = async (port) => {
  try {
    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Handle server shutdown
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      cleanup();
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        server.close();
        startServer(port + 1);
      } else {
        console.error('Server error:', error);
        cleanup();
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    cleanup();
  }
};

// Start the server
startServer(PORT); 