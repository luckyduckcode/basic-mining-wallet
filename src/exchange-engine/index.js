const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();

// Exchange API configurations
const EXCHANGES = {
  binance: {
    api: 'https://api.binance.com',
    apiKey: process.env.BINANCE_API_KEY,
    secretKey: process.env.BINANCE_SECRET_KEY
  },
  coinbase: {
    api: 'https://api.coinbase.com',
    apiKey: process.env.COINBASE_API_KEY,
    secretKey: process.env.COINBASE_SECRET_KEY
  },
  kraken: {
    api: 'https://api.kraken.com',
    apiKey: process.env.KRAKEN_API_KEY,
    secretKey: process.env.KRAKEN_SECRET_KEY
  }
};

// Internal order book
let orderBook = {
  buy: [],
  sell: []
};

// Place internal order
router.post('/order', (req, res) => {
  try {
    const { type, coin, amount, price, walletId } = req.body;

    const order = {
      id: crypto.randomUUID(),
      type, // 'buy' or 'sell'
      coin,
      amount: parseFloat(amount),
      price: parseFloat(price),
      walletId,
      timestamp: new Date(),
      status: 'pending'
    };

    if (type === 'buy') {
      orderBook.buy.push(order);
      orderBook.buy.sort((a, b) => b.price - a.price); // Highest price first
    } else {
      orderBook.sell.push(order);
      orderBook.sell.sort((a, b) => a.price - b.price); // Lowest price first
    }

    // Try to match orders
    matchOrders();

    res.json({ orderId: order.id, status: 'placed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order book
router.get('/orderbook/:coin', (req, res) => {
  const { coin } = req.params;

  const filteredBuy = orderBook.buy.filter(order => order.coin === coin);
  const filteredSell = orderBook.sell.filter(order => order.coin === coin);

  res.json({
    coin,
    buy: filteredBuy.slice(0, 10), // Top 10 buy orders
    sell: filteredSell.slice(0, 10) // Top 10 sell orders
  });
});

// Get market prices from external exchanges
router.get('/prices/:coin', async (req, res) => {
  try {
    const { coin } = req.params;
    const prices = {};

    // Get prices from multiple exchanges
    for (const [exchangeName, config] of Object.entries(EXCHANGES)) {
      try {
        const response = await axios.get(`${config.api}/api/v3/ticker/price?symbol=${coin}USDT`);
        prices[exchangeName] = parseFloat(response.data.price);
      } catch (error) {
        console.log(`Failed to get price from ${exchangeName}:`, error.message);
      }
    }

    // Calculate best prices
    const priceValues = Object.values(prices);
    const bestBuy = Math.max(...priceValues);
    const bestSell = Math.min(...priceValues);

    res.json({
      coin,
      prices,
      bestBuy,
      bestSell,
      spread: ((bestBuy - bestSell) / bestSell) * 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute arbitrage trade
router.post('/arbitrage', async (req, res) => {
  try {
    const { coin, amount, buyExchange, sellExchange } = req.body;

    // This would execute arbitrage between exchanges
    // For now, return simulation result
    const profit = amount * 0.001; // 0.1% profit simulation

    res.json({
      success: true,
      coin,
      amount,
      buyExchange,
      sellExchange,
      profit,
      status: 'executed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trading history
router.get('/history/:walletId', (req, res) => {
  const { walletId } = req.params;

  // This would fetch from database
  // For now, return mock data
  const history = [
    {
      id: '1',
      type: 'buy',
      coin: 'BTC',
      amount: 0.001,
      price: 45000,
      timestamp: new Date(),
      status: 'completed'
    }
  ];

  res.json(history);
});

// Match buy and sell orders
function matchOrders() {
  const buyOrders = orderBook.buy.filter(order => order.status === 'pending');
  const sellOrders = orderBook.sell.filter(order => order.status === 'pending');

  for (const buyOrder of buyOrders) {
    for (const sellOrder of sellOrders) {
      if (buyOrder.coin === sellOrder.coin &&
          buyOrder.price >= sellOrder.price &&
          buyOrder.amount > 0 &&
          sellOrder.amount > 0) {

        const matchAmount = Math.min(buyOrder.amount, sellOrder.amount);

        // Update order amounts
        buyOrder.amount -= matchAmount;
        sellOrder.amount -= matchAmount;

        // Mark as completed if fully filled
        if (buyOrder.amount === 0) buyOrder.status = 'completed';
        if (sellOrder.amount === 0) sellOrder.status = 'completed';

        console.log(`Matched ${matchAmount} ${buyOrder.coin} at ${sellOrder.price}`);
      }
    }
  }

  // Remove completed orders
  orderBook.buy = orderBook.buy.filter(order => order.amount > 0);
  orderBook.sell = orderBook.sell.filter(order => order.amount > 0);
}

module.exports = router;
