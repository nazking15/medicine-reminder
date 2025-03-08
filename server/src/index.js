require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { sendDailyReminders } = require('./utils/notificationService');

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: ['https://medicine-reminder-hhaq.vercel.app', 'https://medicine-reminder-hazel.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

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

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Health check endpoint (before routes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

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