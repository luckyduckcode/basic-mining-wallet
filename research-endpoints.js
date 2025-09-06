const axios = require('axios');

// List of coins that failed in our previous test
const failedCoins = [
  'monero', 'ravencoin', 'ergo', 'bitcoingold', 'beam', 'zcash',
  'aeternity', 'bitcoininterest', 'conceal', 'zelcash', 'grin',
  'vertcoin', 'peercoin', 'digibyte', 'syscoin', 'flux', 'komodo',
  'aion', 'cortex', 'callisto', 'ellaism', 'musicoin', 'pirl',
  'yocoin', 'zoin', 'zero', 'vidulum', 'swap', 'gentarium',
  'bitcore', 'trezarcoin', 'hempcoin', 'globalboost', 'ethergem',
  'ethersocial', 'akroma', 'atheios', 'metaverse', 'quarkchain',
  'ether1', 'mix', 'ixian', 'bolivarcoin', 'pigeoncoin', 'rapids',
  'suqa', 'argoneum', 'socialsend', 'phore', 'stipend', 'raptoreum'
];

// Potential alternative RPC endpoints to try
const alternativeEndpoints = {
  monero: [
    'https://node.monerooutreach.org',
    'https://xmr-node.cakewallet.com',
    'https://node.moneroworld.com',
    'https://monero.fail'
  ],
  ravencoin: [
    'https://rvn-rpc-mainnet.ting.finance',
    'https://main.ravencoin.network',
    'https://rpc.ravencoin.org'
  ],
  ergo: [
    'https://api.ergoplatform.com',
    'https://node.ergopool.io',
    'https://ergo-node.anonero.net'
  ],
  zcash: [
    'https://zcash-rpc.my-mining-pool.de',
    'https://mainnet.zcash.network',
    'https://zcash.anonero.net'
  ],
  grin: [
    'https://grin-api.mainnet.iim.mw',
    'https://grin.ekascan.com',
    'https://grin.flypool.org'
  ],
  vertcoin: [
    'https://explorer.vertcoin.org/api',
    'https://vtnode.ekascan.com',
    'https://vertcoin.anonero.net'
  ],
  digibyte: [
    'https://digibyte-explorer.com/api',
    'https://digibyte.ekascan.com',
    'https://dgb.anonero.net'
  ],
  syscoin: [
    'https://explorer.syscoin.org/api',
    'https://sys.ekascan.com',
    'https://syscoin.anonero.net'
  ],
  flux: [
    'https://explorer.runonflux.io/api',
    'https://flux.ekascan.com',
    'https://zel.anonero.net'
  ],
  komodo: [
    'https://komodo-explorer.com/api',
    'https://kmd.ekascan.com',
    'https://komodo.anonero.net'
  ],
  // Generic alternatives for coins without specific endpoints
  generic: [
    'https://api.blockcypher.com/v1',
    'https://blockchain.info',
    'https://api.smartbit.com.au/v1',
    'https://api.blockchair.com'
  ]
};

async function testEndpoint(endpoint, coin, timeout = 5000) {
  try {
    // Try a simple health check or basic RPC call
    let response;

    if (endpoint.includes('api.')) {
      // Try API endpoint
      response = await axios.get(`${endpoint}/status`, { timeout });
    } else {
      // Try RPC endpoint with a basic method
      response = await axios.post(endpoint, {
        jsonrpc: '2.0',
        id: 'test',
        method: 'getblockcount',
        params: []
      }, { timeout });
    }

    return { success: true, response: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function findWorkingEndpoints() {
  console.log('🔍 Researching Better RPC Endpoints for Failed Coins\n');
  console.log('=' .repeat(80));

  const results = {
    found: {},
    notFound: []
  };

  for (const coin of failedCoins) {
    console.log(`\n🪙 Researching ${coin.toUpperCase()}`);
    console.log('-'.repeat(40));

    const endpoints = alternativeEndpoints[coin] || alternativeEndpoints.generic;
    let foundWorking = false;

    for (const endpoint of endpoints) {
      console.log(`  🔗 Testing: ${endpoint}`);
      const result = await testEndpoint(endpoint, coin);

      if (result.success) {
        console.log(`    ✅ WORKING: ${endpoint}`);
        if (!results.found[coin]) {
          results.found[coin] = [];
        }
        results.found[coin].push(endpoint);
        foundWorking = true;
      } else {
        console.log(`    ❌ FAILED: ${result.error}`);
      }
    }

    if (!foundWorking) {
      results.notFound.push(coin);
      console.log(`  💥 No working endpoints found for ${coin}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 ENDPOINT RESEARCH SUMMARY');
  console.log('='.repeat(80));

  const foundCount = Object.keys(results.found).length;
  const notFoundCount = results.notFound.length;

  console.log(`✅ Coins with working endpoints: ${foundCount}`);
  console.log(`❌ Coins without working endpoints: ${notFoundCount}`);
  console.log(`📈 Success Rate: ${((foundCount / failedCoins.length) * 100).toFixed(1)}%`);

  if (foundCount > 0) {
    console.log('\n✅ Coins with working endpoints:');
    for (const [coin, endpoints] of Object.entries(results.found)) {
      console.log(`  - ${coin}: ${endpoints.length} endpoint(s) found`);
      endpoints.forEach(endpoint => console.log(`    • ${endpoint}`));
    }
  }

  if (notFoundCount > 0) {
    console.log('\n❌ Coins without working endpoints:');
    results.notFound.forEach(coin => console.log(`  - ${coin}`));
  }

  return results;
}

// Generate updated RPC configuration
function generateUpdatedConfig(results) {
  const updatedConfig = {};

  for (const [coin, endpoints] of Object.entries(results.found)) {
    updatedConfig[coin] = {
      mainnet: endpoints[0], // Use first working endpoint
      testnet: endpoints[0]  // Use same for testnet if no specific testnet available
    };
  }

  return updatedConfig;
}

// Run the research
if (require.main === module) {
  findWorkingEndpoints()
    .then(results => {
      console.log('\n🎉 Endpoint research completed!');

      // Generate and display updated configuration
      const updatedConfig = generateUpdatedConfig(results);
      if (Object.keys(updatedConfig).length > 0) {
        console.log('\n📝 Updated RPC Configuration:');
        console.log(JSON.stringify(updatedConfig, null, 2));
      }

      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Research failed with error:', error);
      process.exit(1);
    });
}

module.exports = { findWorkingEndpoints, generateUpdatedConfig };
