const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/wallet';

// Test Bitcoin balance (using a known testnet address)
async function testBitcoinBalance() {
  try {
    console.log('Testing Bitcoin balance...');
    console.log('Making request to:', `${BASE_URL}/balance/bitcoin/tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx`);
    const response = await axios.get(`${BASE_URL}/balance/bitcoin/tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx`);
    console.log('Bitcoin balance response:', response.data);
  } catch (error) {
    console.log('Bitcoin balance error details:');
    console.log('Message:', error.message);
    console.log('Code:', error.code);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('Request made but no response received');
    }
  }
}

// Test Ethereum balance
async function testEthereumBalance() {
  try {
    console.log('Testing Ethereum balance...');
    console.log('Making request to:', `${BASE_URL}/balance/ethereum/0x742d35Cc6634C0532925a3b844Bc454e4438f44e`);
    const response = await axios.get(`${BASE_URL}/balance/ethereum/0x742d35Cc6634C0532925a3b844Bc454e4438f44e`);
    console.log('Ethereum balance response:', response.data);
  } catch (error) {
    console.log('Ethereum balance error details:');
    console.log('Message:', error.message);
    console.log('Code:', error.code);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('Request made but no response received');
    }
  }
}

// Test Monero balance
async function testMoneroBalance() {
  try {
    console.log('Testing Monero balance...');
    const response = await axios.get(`${BASE_URL}/balance/monero/888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPqYVncKvCAWgqb6iKvvQZq4r5sZMLYHnjpW4d7x5XUz24`);
    console.log('Monero balance response:', response.data);
  } catch (error) {
    console.log('Monero balance error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    }
  }
}

// Test fee estimation
async function testFeeEstimation() {
  try {
    console.log('Testing fee estimation...');
    const response = await axios.post(`${BASE_URL}/estimate-fee`, {
      coin: 'bitcoin',
      network: 'mainnet'
    });
    console.log('Fee estimation response:', response.data);
  } catch (error) {
    console.log('Fee estimation error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing live blockchain integration...\n');

  await testBitcoinBalance();
  console.log('');

  await testEthereumBalance();
  console.log('');

  await testMoneroBalance();
  console.log('');

  await testFeeEstimation();
  console.log('');

  console.log('✅ Tests completed!');
}

runTests().catch(console.error);
