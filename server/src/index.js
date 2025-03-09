// Trigger Vercel redeployment - Updated JWT configuration
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectToDatabase } = require('./utils/db');
const initializeRoutes = require('./routes');

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
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://medicine-reminder-hhaq.vercel.app',
  'https://medicine-reminder-hazel.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Origin not allowed:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    console.log('Origin allowed:', origin);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Pre-flight requests
app.options('*', cors());

// Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', true);
  }
  next();
});

// Initialize routes
initializeRoutes(app);

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

// Export for serverless
module.exports = app; 