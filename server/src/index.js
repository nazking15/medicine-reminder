// Trigger Vercel redeployment - Updated JWT configuration
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectToDatabase } = require('./utils/db');

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Log environment configuration
console.log('Environment configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length,
  MONGODB_URI_SET: !!process.env.MONGODB_URI,
  PORT: process.env.PORT || 3001
});

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

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

// Pre-flight requests
app.options('*', (req, res) => {
  console.log('Handling OPTIONS request');
  res.sendStatus(200);
});

// Database connection middleware
app.use(async (req, res, next) => {
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

// Mount all routes under /api
const routes = require('./routes');
app.use('/api', routes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
      status: 'healthy',
      message: 'Server is running and database is ' + dbStatus,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      message: 'Server error',
      error: error.message
    });
  }
});

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

// Connect to database if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  connectToDatabase()
    .then(() => {
      const PORT = process.env.PORT || 3001;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch(error => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

// Export the Express app for serverless use
module.exports = app; 