const axios = require('axios');
const BASE_URL = 'http://localhost:3001/api/wallet';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealth() {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get('http://localhost:3001/health');
    console.log('Health response:', response.data);
    return true;
  } catch (error) {
    console.log('Health error:', error.message);
    return false;
  }
}

async function testBitcoinBalance() {
  try {
    console.log('Testing Bitcoin balance...');
    const response = await axios.get(`${BASE_URL}/balance/bitcoin/tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx`);
    console.log('Bitcoin balance response:', response.data);
  } catch (error) {
    console.log('Bitcoin balance error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('Waiting for server to start...');
  await delay(3000); // Wait 3 seconds

  const serverUp = await testHealth();
  if (serverUp) {
    await testBitcoinBalance();
  }
}

runTests();
