const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Import RPC endpoints from transactions.js
const transactionsPath = path.join(__dirname, 'src', 'wallet-core', 'transactions.js');
const transactionsContent = fs.readFileSync(transactionsPath, 'utf8');

// Extract RPC_ENDPOINTS from the file
const rpcEndpointsMatch = transactionsContent.match(/const RPC_ENDPOINTS = ({[\s\S]*?});/);
if (!rpcEndpointsMatch) {
  console.error('Could not find RPC_ENDPOINTS in transactions.js');
  process.exit(1);
}

let RPC_ENDPOINTS;
try {
  eval('RPC_ENDPOINTS = ' + rpcEndpointsMatch[1]);
} catch (error) {
  console.error('Error parsing RPC_ENDPOINTS:', error);
  process.exit(1);
}

class RPCTester {
  constructor() {
    this.results = {
      total: 0,
      successful: 0,
      failed: 0,
      details: []
    };
    this.timeout = 10000; // 10 second timeout
  }

  async testEndpoint(coin, network, url) {
    console.log(`Testing ${coin} (${network}): ${url}`);

    const startTime = Date.now();

    try {
      // Different test methods based on coin type
      let response;

      if (coin.toLowerCase().includes('monero') || coin.toLowerCase().includes('conceal')) {
        // Monero-style RPC
        response = await axios.post(url, {
          jsonrpc: '2.0',
          id: 'test',
          method: 'get_info',
          params: {}
        }, { timeout: this.timeout });
      } else if (coin.toLowerCase().includes('ethereum') || coin.toLowerCase().includes('energi') ||
                 coin.toLowerCase().includes('thundercore') || coin.toLowerCase().includes('gochain') ||
                 coin.toLowerCase().includes('ether1') || coin.toLowerCase().includes('mix') ||
                 coin.toLowerCase().includes('callisto') || coin.toLowerCase().includes('ellaism') ||
                 coin.toLowerCase().includes('expanse') || coin.toLowerCase().includes('musicoin') ||
                 coin.toLowerCase().includes('pirl') || coin.toLowerCase().includes('yocoin') ||
                 coin.toLowerCase().includes('ubiq') || coin.toLowerCase().includes('ethergem') ||
                 coin.toLowerCase().includes('ethersocial') || coin.toLowerCase().includes('akroma') ||
                 coin.toLowerCase().includes('atheios') || coin.toLowerCase().includes('metaverse') ||
                 coin.toLowerCase().includes('quarkchain') || coin.toLowerCase().includes('conflux') ||
                 coin.toLowerCase().includes('aion') || coin.toLowerCase().includes('cortex') ||
                 coin.toLowerCase().includes('aeternity')) {
        // Ethereum-style RPC
        response = await axios.post(url, {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_blockNumber',
          params: []
        }, { timeout: this.timeout });
      } else if (coin.toLowerCase().includes('ergo') || coin.toLowerCase().includes('beam') ||
                 coin.toLowerCase().includes('grin')) {
        // Custom RPC methods
        response = await axios.post(url, {
          jsonrpc: '2.0',
          id: 'test',
          method: 'get_info',
          params: []
        }, { timeout: this.timeout });
      } else {
        // Bitcoin-style RPC
        response = await axios.post(url, {
          jsonrpc: '2.0',
          id: 'test',
          method: 'getblockcount',
          params: []
        }, { timeout: this.timeout });
      }

      const responseTime = Date.now() - startTime;
      const success = response.status === 200 && response.data;

      this.results.details.push({
        coin,
        network,
        url,
        status: 'SUCCESS',
        responseTime,
        error: null
      });

      console.log(`✅ ${coin} (${network}): SUCCESS (${responseTime}ms)`);
      return true;

    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.results.details.push({
        coin,
        network,
        url,
        status: 'FAILED',
        responseTime,
        error: error.message
      });

      console.log(`❌ ${coin} (${network}): FAILED - ${error.message} (${responseTime}ms)`);
      return false;
    }
  }

  async testAllEndpoints() {
    console.log('🚀 Starting RPC Connectivity Test for All Cryptocurrencies\n');
    console.log('=' .repeat(60));

    for (const [coin, networks] of Object.entries(RPC_ENDPOINTS)) {
      this.results.total++;

      // Test mainnet first
      if (networks.mainnet) {
        const success = await this.testEndpoint(coin, 'mainnet', networks.mainnet);
        if (success) {
          this.results.successful++;
        } else {
          this.results.failed++;
        }
      }

      // Test testnet if available
      if (networks.testnet) {
        this.results.total++;
        const success = await this.testEndpoint(coin, 'testnet', networks.testnet);
        if (success) {
          this.results.successful++;
        } else {
          this.results.failed++;
        }
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RPC CONNECTIVITY TEST SUMMARY');
    console.log('=' .repeat(60));

    console.log(`Total Endpoints Tested: ${this.results.total}`);
    console.log(`Successful: ${this.results.successful}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.successful / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Endpoints:');
      this.results.details
        .filter(result => result.status === 'FAILED')
        .forEach(result => {
          console.log(`  - ${result.coin} (${result.network}): ${result.error}`);
        });
    }

    // Save detailed results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = path.join(__dirname, `rpc-test-results-${timestamp}.json`);

    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
  }
}

// Run the test
async function main() {
  const tester = new RPCTester();
  await tester.testAllEndpoints();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = RPCTester;
