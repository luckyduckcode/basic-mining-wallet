const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/wallet';

const GMiner_COINS = ['bitcoin', 'ethereum', 'monero', 'ravencoin', 'ergo', 'conflux'];

async function testAllCoins() {
  console.log('🧪 Testing all GMiner-supported cryptocurrencies...\n');

  for (const coin of GMiner_COINS) {
    console.log(`Testing ${coin.toUpperCase()}:`);

    try {
      // Test balance
      const balanceResponse = await axios.get(`${BASE_URL}/balance/${coin}/test-address`);
      console.log(`✅ Balance: ${balanceResponse.data.balance}`);
    } catch (error) {
      console.log(`❌ Balance error: ${error.message}`);
    }

    try {
      // Test fee estimation
      const feeResponse = await axios.post(`${BASE_URL}/estimate-fee`, {
        coin: coin,
        network: 'mainnet'
      });
      console.log(`✅ Fee estimation: ${JSON.stringify(feeResponse.data.feeEstimate)}`);
    } catch (error) {
      console.log(`❌ Fee estimation error: ${error.message}`);
    }

    console.log(''); // Empty line between coins
  }

  console.log('🎉 Testing completed for all GMiner-supported cryptocurrencies!');
}

testAllCoins().catch(console.error);
