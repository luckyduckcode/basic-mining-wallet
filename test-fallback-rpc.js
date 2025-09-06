const axios = require('axios');

// Enhanced RPC configuration with fallback endpoints
const RPC_ENDPOINTS = {
  bitcoin: {
    mainnet: [
      process.env.BITCOIN_RPC_URL || 'https://bitcoin-rpc.publicnode.com',
      'https://api.smartbit.com.au/v1',
      'https://blockchain.info'
    ],
    testnet: [
      process.env.BITCOIN_TESTNET_RPC_URL || 'https://bitcoin-testnet-rpc.publicnode.com',
      'https://testnet-api.smartbit.com.au/v1'
    ],
    username: process.env.BITCOIN_RPC_USER || '',
    password: process.env.BITCOIN_RPC_PASS || ''
  },
  ethereum: {
    mainnet: [
      process.env.ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
      'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      'https://api.etherscan.io/api'
    ],
    sepolia: [
      process.env.ETHEREUM_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
      'https://sepolia.infura.io/v3/YOUR_PROJECT_ID'
    ],
    goerli: [
      process.env.ETHEREUM_GOERLI_RPC_URL || 'https://ethereum-goerli-rpc.publicnode.com',
      'https://goerli.infura.io/v3/YOUR_PROJECT_ID'
    ]
  },
  monero: {
    mainnet: [
      process.env.MONERO_RPC_URL || 'https://monero.fail',
      'https://node.monerooutreach.org',
      'https://xmr-node.cakewallet.com'
    ],
    testnet: [
      process.env.MONERO_TESTNET_RPC_URL || 'https://monero-testnet-rpc.publicnode.com',
      'https://testnet.xmr-tw.org'
    ],
    stagenet: [
      process.env.MONERO_STAGENET_RPC_URL || 'https://monero-stagenet-rpc.publicnode.com',
      'https://stagenet.xmr-tw.org'
    ]
  },
  ravencoin: {
    mainnet: [
      process.env.RAVENCOIN_RPC_URL || 'https://api.smartbit.com.au/v1',
      'https://rvn-rpc-mainnet.ting.finance'
    ],
    testnet: [
      process.env.RAVENCOIN_TESTNET_RPC_URL || 'https://ravencoin-testnet-rpc.publicnode.com',
      'https://rvn-rpc-testnet.ting.finance'
    ]
  },
  ergo: {
    mainnet: [
      process.env.ERGO_RPC_URL || 'https://api.smartbit.com.au/v1',
      'https://api.ergoplatform.com'
    ],
    testnet: [
      process.env.ERGO_TESTNET_RPC_URL || 'https://ergo-testnet-rpc.publicnode.com',
      'https://api-testnet.ergoplatform.com'
    ]
  },
  conflux: {
    mainnet: [
      process.env.CONFLUX_RPC_URL || 'https://main.confluxrpc.com',
      'https://api.smartbit.com.au/v1'
    ],
    testnet: [
      process.env.CONFLUX_TESTNET_RPC_URL || 'https://conflux-testnet-rpc.publicnode.com',
      'https://test.confluxrpc.com'
    ]
  },
  zcash: {
    mainnet: [
      process.env.ZCASH_RPC_URL || 'https://api.smartbit.com.au/v1',
      'https://zcash-rpc.my-mining-pool.de'
    ],
    testnet: [
      process.env.ZCASH_TESTNET_RPC_URL || 'https://zcash-testnet-rpc.publicnode.com',
      'https://zcash-testnet-rpc.my-mining-pool.de'
    ]
  },
  // Add more coins with fallback arrays...
  bitcoingold: {
    mainnet: [
      process.env.BITCOINGOLD_RPC_URL || 'https://api.smartbit.com.au/v1',
      'https://explorer.bitcoingold.org/api'
    ],
    testnet: [
      process.env.BITCOINGOLD_TESTNET_RPC_URL || 'https://bitcoingold-testnet-rpc.publicnode.com',
      'https://test-explorer.bitcoingold.org/api'
    ]
  },
  // Template for other coins
  defaultFallbacks: [
    'https://api.smartbit.com.au/v1',
    'https://api.blockcypher.com/v1',
    'https://blockchain.info'
  ]
};

// Enhanced RPC call function with automatic fallback
async function makeRPCCall(coin, network, method, params = [], options = {}) {
  const endpoints = RPC_ENDPOINTS[coin]?.[network] || RPC_ENDPOINTS.defaultFallbacks;
  const rpcConfig = RPC_ENDPOINTS[coin];

  // Try each endpoint in order
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];

    try {
      console.log(`🔗 Trying ${coin} ${network} endpoint ${i + 1}/${endpoints.length}: ${endpoint}`);

      let response;
      const requestConfig = {
        timeout: options.timeout || 10000,
        ...options
      };

      // Add auth if available
      if (rpcConfig?.username && rpcConfig?.password) {
        requestConfig.auth = {
          username: rpcConfig.username,
          password: rpcConfig.password
        };
      }

      // Handle different RPC formats
      if (endpoint.includes('api.smartbit.com.au')) {
        // SmartBit API format
        const apiParams = new URLSearchParams();
        if (method === 'getreceivedbyaddress') {
          apiParams.append('address', params[0]);
        }

        response = await axios.get(`${endpoint}/address/${params[0]}`, {
          ...requestConfig,
          params: apiParams
        });

        // Transform SmartBit response to standard RPC format
        return {
          data: {
            result: response.data?.address?.total?.received || 0
          }
        };
      } else {
        // Standard JSON-RPC format
        response = await axios.post(endpoint, {
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params
        }, requestConfig);
      }

      console.log(`✅ ${coin} ${network} - Success with endpoint ${i + 1}`);
      return response;

    } catch (error) {
      console.warn(`❌ ${coin} ${network} endpoint ${i + 1} failed:`, error.message);

      // If this is the last endpoint, throw the error
      if (i === endpoints.length - 1) {
        throw new Error(`All ${endpoints.length} endpoints failed for ${coin} ${network}. Last error: ${error.message}`);
      }

      // Otherwise, continue to next endpoint
      continue;
    }
  }
}

// Test the fallback functionality
async function testFallbackRPC() {
  console.log('🧪 Testing RPC Fallback Functionality\n');
  console.log('=' .repeat(80));

  const testCases = [
    { coin: 'bitcoin', network: 'mainnet', method: 'getreceivedbyaddress', params: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'] },
    { coin: 'ethereum', network: 'mainnet', method: 'eth_getBalance', params: ['0x0000000000000000000000000000000000000000', 'latest'] },
    { coin: 'monero', network: 'mainnet', method: 'get_balance', params: [{ account_index: 0 }] },
    { coin: 'ravencoin', network: 'mainnet', method: 'getreceivedbyaddress', params: ['RK9w6aHabJ4P6zN4N7Xa5T2s8K5J3M8N1'] },
    { coin: 'zcash', network: 'mainnet', method: 'getreceivedbyaddress', params: ['t1a1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'] }
  ];

  const results = {
    successful: [],
    failed: []
  };

  for (const testCase of testCases) {
    const { coin, network, method, params } = testCase;

    try {
      console.log(`\n🪙 Testing ${coin.toUpperCase()} ${network}`);
      console.log('-'.repeat(40));

      const response = await makeRPCCall(coin, network, method, params);
      console.log(`✅ ${coin} ${network} - SUCCESS:`, response.data.result);

      results.successful.push(`${coin}-${network}`);

    } catch (error) {
      console.log(`❌ ${coin} ${network} - FAILED: ${error.message}`);
      results.failed.push(`${coin}-${network}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FALLBACK RPC TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📈 Success Rate: ${((results.successful.length / testCases.length) * 100).toFixed(1)}%`);

  if (results.successful.length > 0) {
    console.log('\n✅ Working coins:');
    results.successful.forEach(coin => console.log(`  - ${coin}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed coins:');
    results.failed.forEach(coin => console.log(`  - ${coin}`));
  }

  return results;
}

// Export for use in other modules
module.exports = {
  RPC_ENDPOINTS,
  makeRPCCall,
  testFallbackRPC
};

// Run test if called directly
if (require.main === module) {
  testFallbackRPC()
    .then(() => {
      console.log('\n🎉 Fallback RPC test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed with error:', error);
      process.exit(1);
    });
}
