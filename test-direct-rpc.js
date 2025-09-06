const axios = require('axios');

// Test RPC endpoints directly (bypassing the API server)
const RPC_ENDPOINTS = {
  bitcoin: {
    mainnet: 'https://bitcoin-rpc.publicnode.com',
    testnet: 'https://bitcoin-testnet-rpc.publicnode.com'
  },
  ethereum: {
    mainnet: 'https://ethereum-rpc.publicnode.com',
    sepolia: 'https://ethereum-sepolia-rpc.publicnode.com'
  },
  conflux: {
    mainnet: 'https://main.confluxrpc.com'
  },
  zelcash: {
    mainnet: 'https://explorer.zel.cash/api'
  },
  peercoin: {
    mainnet: 'https://explorer.peercoin.net/api'
  },
  expanse: {
    mainnet: 'https://node.expanse.tech'
  },
  ubiq: {
    mainnet: 'https://rpc.ubiqscan.io'
  },
  energi: {
    mainnet: 'https://nodeapi.energi.network'
  },
  thundercore: {
    mainnet: 'https://mainnet-rpc.thundercore.com'
  },
  gochain: {
    mainnet: 'https://rpc.gochain.io'
  },
  viacoin: {
    mainnet: 'https://explorer.viacoin.org/api'
  }
};

// Test addresses
const testAddresses = {
  bitcoin: {
    mainnet: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    testnet: 'mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt'
  },
  ethereum: {
    mainnet: '0x0000000000000000000000000000000000000000',
    sepolia: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  },
  conflux: {
    mainnet: 'cfx:aanpezy1z8bz91j1h1h2x6jz8k8z8z8z8z8z8z8z8z'
  },
  zelcash: {
    mainnet: 't1a1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
  },
  peercoin: {
    mainnet: 'PHCEsP6odugNNjRWz5d2Q2JFKqH3mWk7jL'
  },
  expanse: {
    mainnet: '0x0000000000000000000000000000000000000000'
  },
  ubiq: {
    mainnet: '0x0000000000000000000000000000000000000000'
  },
  energi: {
    mainnet: '0x0000000000000000000000000000000000000000'
  },
  thundercore: {
    mainnet: '0x0000000000000000000000000000000000000000'
  },
  gochain: {
    mainnet: '0x0000000000000000000000000000000000000000'
  },
  viacoin: {
    mainnet: 'VceQceX1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z'
  }
};

const workingCoins = [
  'bitcoin', 'ethereum', 'conflux', 'zelcash', 'peercoin',
  'expanse', 'ubiq', 'energi', 'thundercore', 'gochain', 'viacoin'
];

async function testBitcoinRPC(endpoint, address, network) {
  try {
    const response = await axios.post(endpoint, {
      jsonrpc: '2.0',
      id: 'test',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });

    return response.data.result || 0;
  } catch (error) {
    throw new Error(`Bitcoin RPC failed: ${error.message}`);
  }
}

async function testEthereumRPC(endpoint, address, network) {
  try {
    const response = await axios.post(endpoint, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });

    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    throw new Error(`Ethereum RPC failed: ${error.message}`);
  }
}

async function testGenericRPC(endpoint, address, network, coin) {
  try {
    // Try different RPC methods based on coin type
    let method, params;

    if (coin === 'conflux') {
      method = 'cfx_getBalance';
      params = [address, 'latest'];
    } else if (['expanse', 'ubiq', 'energi', 'thundercore', 'gochain'].includes(coin)) {
      method = 'eth_getBalance';
      params = [address, 'latest'];
    } else {
      // For explorer APIs, try a simple GET request
      const response = await axios.get(`${endpoint}/api/v1/address/${address}`, { timeout: 10000 });
      return response.data?.balance || 0;
    }

    const response = await axios.post(endpoint, {
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    }, { timeout: 10000 });

    if (method === 'eth_getBalance') {
      return parseInt(response.data.result, 16) / 1e18;
    } else if (method === 'cfx_getBalance') {
      return parseInt(response.data.result, 16) / 1e18;
    }

    return response.data.result || 0;
  } catch (error) {
    throw new Error(`${coin} RPC failed: ${error.message}`);
  }
}

async function testCoinRPC(coin, network, address) {
  const endpoint = RPC_ENDPOINTS[coin][network];

  try {
    let balance;

    if (coin === 'bitcoin') {
      balance = await testBitcoinRPC(endpoint, address, network);
    } else if (coin === 'ethereum') {
      balance = await testEthereumRPC(endpoint, address, network);
    } else {
      balance = await testGenericRPC(endpoint, address, network, coin);
    }

    console.log(`    ✅ ${coin} (${network}) - Balance: ${balance}`);
    return true;
  } catch (error) {
    console.log(`    ❌ ${coin} (${network}) - ${error.message}`);
    return false;
  }
}

async function testTransactionFunctionality() {
  console.log('🚀 Testing Direct RPC Connectivity for Working Endpoints\n');
  console.log('=' .repeat(80));

  const results = {
    successful: [],
    failed: []
  };

  for (const coin of workingCoins) {
    console.log(`\n🪙 Testing ${coin.toUpperCase()}`);
    console.log('-'.repeat(40));

    const networks = Object.keys(testAddresses[coin] || {});
    let coinSuccessful = false;

    for (const network of networks) {
      const address = testAddresses[coin][network];
      console.log(`\n📡 Testing ${network} network with address: ${address}`);

      const success = await testCoinRPC(coin, network, address);
      if (success) {
        coinSuccessful = true;
      }
    }

    if (coinSuccessful) {
      results.successful.push(coin);
    } else {
      results.failed.push(coin);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 DIRECT RPC TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📈 Success Rate: ${((results.successful.length / workingCoins.length) * 100).toFixed(1)}%`);

  if (results.successful.length > 0) {
    console.log('\n✅ Working Coins:');
    results.successful.forEach(coin => console.log(`  - ${coin}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Coins:');
    results.failed.forEach(coin => console.log(`  - ${coin}`));
  }

  return results;
}

// Run the test
if (require.main === module) {
  testTransactionFunctionality()
    .then(() => {
      console.log('\n🎉 Direct RPC test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed with error:', error);
      process.exit(1);
    });
}

module.exports = { testTransactionFunctionality };
