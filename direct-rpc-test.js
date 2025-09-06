const axios = require('axios');

// Test Bitcoin RPC directly
async function testBitcoinRPC() {
  try {
    console.log('Testing Bitcoin RPC...');
    const response = await axios.post('https://bitcoin-testnet-rpc.publicnode.com', {
      jsonrpc: '2.0',
      id: 'test',
      method: 'getblockcount',
      params: []
    }, {
      timeout: 10000
    });
    console.log('Bitcoin RPC response:', response.data);
  } catch (error) {
    console.log('Bitcoin RPC error:', error.message);
  }
}

// Test Ethereum RPC directly
async function testEthereumRPC() {
  try {
    console.log('Testing Ethereum RPC...');
    const response = await axios.post('https://ethereum-sepolia-rpc.publicnode.com', {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_blockNumber',
      params: []
    }, {
      timeout: 10000
    });
    console.log('Ethereum RPC response:', response.data);
  } catch (error) {
    console.log('Ethereum RPC error:', error.message);
  }
}

// Test Monero RPC directly
async function testMoneroRPC() {
  try {
    console.log('Testing Monero RPC...');
    const response = await axios.post('https://monero-testnet-rpc.publicnode.com', {
      jsonrpc: '2.0',
      id: 'test',
      method: 'getblockcount',
      params: {}
    }, {
      timeout: 10000
    });
    console.log('Monero RPC response:', response.data);
  } catch (error) {
    console.log('Monero RPC error:', error.message);
  }
}

async function runTests() {
  await testBitcoinRPC();
  await testEthereumRPC();
  await testMoneroRPC();
}

runTests();
