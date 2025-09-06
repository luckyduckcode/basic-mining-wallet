const axios = require('axios');

// Test the actual functions from our transactions module
async function getBitcoinBalance(address, network = 'mainnet') {
  try {
    const rpcConfig = {
      mainnet: 'https://bitcoin-rpc.publicnode.com',
      testnet: 'https://bitcoin-testnet-rpc.publicnode.com'
    };

    const response = await axios.post(rpcConfig[network], {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, {
      timeout: 10000
    });

    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcoin RPC error:', error.message);
    throw new Error(`Failed to get Bitcoin balance: ${error.message}`);
  }
}

async function getEthereumBalance(address, network = 'mainnet') {
  try {
    const rpcConfig = {
      mainnet: 'https://ethereum-rpc.publicnode.com',
      sepolia: 'https://ethereum-sepolia-rpc.publicnode.com'
    };

    const response = await axios.post(rpcConfig[network], {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, {
      timeout: 10000
    });

    return parseInt(response.data.result, 16) / 1e18; // Convert wei to ETH
  } catch (error) {
    console.error('Ethereum RPC error:', error.message);
    throw new Error(`Failed to get Ethereum balance: ${error.message}`);
  }
}

async function testBalances() {
  try {
    console.log('Testing Bitcoin balance...');
    const btcBalance = await getBitcoinBalance('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'); // Satoshi's address
    console.log('Bitcoin balance:', btcBalance);

    console.log('Testing Ethereum balance...');
    const ethBalance = await getEthereumBalance('0x0000000000000000000000000000000000000000'); // Zero address
    console.log('Ethereum balance:', ethBalance);

  } catch (error) {
    console.log('Test error:', error.message);
  }
}

testBalances();
