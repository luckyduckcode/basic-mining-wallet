const axios = require('axios');

// Test the API endpoints directly
const API_BASE_URL = 'http://localhost:3000'; // Assuming the server runs on port 3000

// Test addresses for different cryptocurrencies
const testAddresses = {
  bitcoin: {
    mainnet: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Satoshi's genesis address
    testnet: 'mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt' // Testnet faucet address
  },
  ethereum: {
    mainnet: '0x0000000000000000000000000000000000000000', // Zero address
    sepolia: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' // Test address
  },
  conflux: {
    mainnet: 'cfx:aanpezy1z8bz91j1h1h2x6jz8k8z8z8z8z8z8z8z8z', // Test address
    testnet: 'cfxtest:aanpezy1z8bz91j1h1h2x6jz8k8z8z8z8z8z8z8z' // Test address
  },
  zelcash: {
    mainnet: 't1a1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Test address
    testnet: 'tmMkHs9ne12qx9pS9VojpwU5xtRd4T7X7ZUt' // Test address
  },
  peercoin: {
    mainnet: 'PHCEsP6odugNNjRWz5d2Q2JFKqH3mWk7jL', // Test address
    testnet: 'mPHCEsP6odugNNjRWz5d2Q2JFKqH3mWk7jL' // Test address
  },
  expanse: {
    mainnet: '0x0000000000000000000000000000000000000000', // Zero address
    testnet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' // Test address
  },
  ubiq: {
    mainnet: '0x0000000000000000000000000000000000000000', // Zero address
    testnet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' // Test address
  },
  energi: {
    mainnet: '0x0000000000000000000000000000000000000000', // Zero address
    testnet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' // Test address
  },
  thundercore: {
    mainnet: '0x0000000000000000000000000000000000000000', // Zero address
    testnet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' // Test address
  },
  gochain: {
    mainnet: '0x0000000000000000000000000000000000000000', // Zero address
    testnet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' // Test address
  },
  viacoin: {
    mainnet: 'VceQceX1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z', // Test address
    testnet: 'tceQceX1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z' // Test address
  }
};

// Working cryptocurrencies from our RPC test
const workingCoins = [
  'bitcoin', 'ethereum', 'conflux', 'zelcash', 'peercoin',
  'expanse', 'ubiq', 'energi', 'thundercore', 'gochain', 'viacoin'
];

async function testEndpoint(endpoint, description) {
  try {
    console.log(`  🔍 Testing ${description}...`);
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, { timeout: 15000 });
    console.log(`    ✅ ${description}: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log(`    ❌ ${description}: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
    return false;
  }
}

async function testTransactionFunctionality() {
  console.log('🚀 Testing Transaction API Endpoints\n');
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

      let networkSuccessful = true;

      // Test 1: Get Balance
      const balanceSuccess = await testEndpoint(
        `/balance/${coin}/${address}?network=${network}`,
        'Balance Check'
      );
      networkSuccessful = networkSuccessful && balanceSuccess;

      // Test 2: Get Transaction History
      const historySuccess = await testEndpoint(
        `/history/${coin}/${address}?network=${network}&limit=5`,
        'Transaction History'
      );
      networkSuccessful = networkSuccessful && historySuccess;

      // Test 3: Estimate Fee
      const feeSuccess = await testEndpoint(
        `/estimate-fee`,
        'Fee Estimation'
      );
      networkSuccessful = networkSuccessful && feeSuccess;

      if (networkSuccessful) {
        console.log(`  ✅ ${coin} (${network}) - ALL TESTS PASSED`);
        coinSuccessful = true;
      } else {
        console.log(`  ❌ ${coin} (${network}) - SOME TESTS FAILED`);
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
  console.log('📊 API ENDPOINT TEST SUMMARY');
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

// Check if server is running first
async function checkServer() {
  try {
    console.log('🔍 Checking if server is running...');
    await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first with: npm start');
    console.log('💡 Make sure the server is running on http://localhost:3000');
    return false;
  }
}

// Run the test
if (require.main === module) {
  checkServer().then(isRunning => {
    if (!isRunning) {
      process.exit(1);
    }

    testTransactionFunctionality()
      .then(() => {
        console.log('\n🎉 API endpoint test completed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n💥 Test failed with error:', error);
        process.exit(1);
      });
  });
}

module.exports = { testTransactionFunctionality };
