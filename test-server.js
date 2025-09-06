const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001; // Use a different port

app.use(cors());
app.use(express.json());

// Load only the wallet module
const walletRouter = require('./src/wallet-core');
app.use('/api/wallet', walletRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server started on port ${PORT}`);
});
