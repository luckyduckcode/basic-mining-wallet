const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Fast startup - only load essential middleware
const app = express();
const PORT = process.env.PORT || 3000;

// Lightweight middleware setup
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Limit payload size for speed
app.use(express.urlencoded({ extended: false })); // Faster parsing

// Serve static files
app.use(express.static('public'));

// Serve wallet dashboard
app.get('/wallet', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wallet.html'));
});

// Load modules synchronously at startup
const walletRouter = require('./src/wallet-core');
const miningRouter = require('./src/mining-integration');
const exchangeRouter = require('./src/exchange-engine');
const securityRouter = require('./src/security');

// Mount routes
app.use('/api/wallet', walletRouter);
app.use('/api/mining', miningRouter);
app.use('/api/exchange', exchangeRouter);
app.use('/api/security', securityRouter);

// Fast health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    modules: Array.from(moduleCache.keys())
  });
});

// Lightweight error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server immediately
app.listen(PORT, () => {
  console.log(`🚀 Basic Mining Wallet started in ${process.uptime().toFixed(3)}s on port ${PORT}`);
});

// Lazy database connection (non-blocking)
setTimeout(() => {
  try {
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basic-mining-wallet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Faster timeout
    })
    .then(() => console.log('📊 Database connected'))
    .catch(err => console.warn('⚠️  Database connection deferred:', err.message));
  } catch (error) {
    console.warn('⚠️  Mongoose not available:', error.message);
  }
}, 1000);

module.exports = app;
