const axios = require('axios');
const fs = require('fs');

// Working RPC endpoints based on our test results
const WORKING_ENDPOINTS = {
    bitcoin: {
        mainnet: 'https://bitcoin-rpc.publicnode.com',
        testnet: 'https://bitcoin-testnet-rpc.publicnode.com'
    },
    ethereum: {
        mainnet: 'https://ethereum-rpc.publicnode.com'
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
    stipend: {
        mainnet: 'https://explorer.stipend.org/api'
    },
    viacoin: {
        mainnet: 'https://explorer.viacoin.org/api'
    }
};

// Test functions for different wallet operations
async function testGetBalance(endpoint, coinName, network) {
    const testAddress = getTestAddress(coinName);
    if (!testAddress) {
        return { status: 'skipped', reason: 'No test address available' };
    }

    try {
        let result;
        
        if (endpoint.includes('/api')) {
            // Block explorer API (Insight-based)
            const response = await axios.get(`${endpoint}/addr/${testAddress}/balance`, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mining-Wallet-Test/1.0' }
            });
            result = { balance: response.data / 100000000 }; // Convert satoshis to main units
        } else {
            // JSON-RPC endpoint
            const rpcData = {
                jsonrpc: '2.0',
                method: getBalanceMethod(coinName),
                params: [testAddress],
                id: 1
            };
            
            const response = await axios.post(endpoint, rpcData, {
                timeout: 10000,
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mining-Wallet-Test/1.0'
                }
            });
            
            result = response.data.result;
        }
        
        return { 
            status: 'success', 
            balance: result.balance || result,
            time: Date.now() 
        };
    } catch (error) {
        return { 
            status: 'failed', 
            error: error.message,
            time: Date.now() 
        };
    }
}

async function testGetTransactionHistory(endpoint, coinName, network) {
    const testAddress = getTestAddress(coinName);
    if (!testAddress) {
        return { status: 'skipped', reason: 'No test address available' };
    }

    try {
        let result;
        
        if (endpoint.includes('/api')) {
            // Block explorer API
            const response = await axios.get(`${endpoint}/addrs/${testAddress}/txs`, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mining-Wallet-Test/1.0' }
            });
            result = { transactions: response.data.items || response.data.txs || [] };
        } else {
            // JSON-RPC endpoint
            const rpcData = {
                jsonrpc: '2.0',
                method: 'listtransactions',
                params: [testAddress, 10],
                id: 1
            };
            
            const response = await axios.post(endpoint, rpcData, {
                timeout: 10000,
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mining-Wallet-Test/1.0'
                }
            });
            
            result = { transactions: response.data.result || [] };
        }
        
        return { 
            status: 'success', 
            transactionCount: result.transactions.length,
            time: Date.now() 
        };
    } catch (error) {
        return { 
            status: 'failed', 
            error: error.message,
            time: Date.now() 
        };
    }
}

async function testGetNetworkInfo(endpoint, coinName, network) {
    try {
        let result;
        
        if (endpoint.includes('/api')) {
            // Block explorer API
            const response = await axios.get(`${endpoint}/status`, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mining-Wallet-Test/1.0' }
            });
            result = response.data.info || response.data;
        } else {
            // JSON-RPC endpoint
            const rpcData = {
                jsonrpc: '2.0',
                method: getNetworkInfoMethod(coinName),
                params: [],
                id: 1
            };
            
            const response = await axios.post(endpoint, rpcData, {
                timeout: 10000,
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mining-Wallet-Test/1.0'
                }
            });
            
            result = response.data.result;
        }
        
        return { 
            status: 'success', 
            networkInfo: result,
            time: Date.now() 
        };
    } catch (error) {
        return { 
            status: 'failed', 
            error: error.message,
            time: Date.now() 
        };
    }
}

async function testEstimateFee(endpoint, coinName, network) {
    try {
        let result;
        
        if (endpoint.includes('/api')) {
            // Block explorer API
            const response = await axios.get(`${endpoint}/utils/estimatefee`, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mining-Wallet-Test/1.0' }
            });
            result = response.data;
        } else {
            // JSON-RPC endpoint
            const rpcData = {
                jsonrpc: '2.0',
                method: getFeeEstimateMethod(coinName),
                params: [6], // 6 blocks confirmation target
                id: 1
            };
            
            const response = await axios.post(endpoint, rpcData, {
                timeout: 10000,
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mining-Wallet-Test/1.0'
                }
            });
            
            result = response.data.result;
        }
        
        return { 
            status: 'success', 
            feeEstimate: result,
            time: Date.now() 
        };
    } catch (error) {
        return { 
            status: 'failed', 
            error: error.message,
            time: Date.now() 
        };
    }
}

// Helper functions
function getTestAddress(coinName) {
    const testAddresses = {
        bitcoin: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        ethereum: '0x742f42c8f4d7e2a9eea9d81e96aeef40b0bb5f3f',
        conflux: 'cfx:aanjn8aakk5kmkgvkpb9eae5cxb4chghaz09xdnwsf',
        zelcash: 't1YeYmJ3vRJxuLNyxgK5rFABLa6zftELFVu',
        peercoin: 'PBfpzCTTTqSGgVrq7LKFjP2qkb1U9dj5Jk',
        expanse: '0x02f7f0d97b36ad71cf0e8e7c8c9d9e8b8c8b8c8b',
        ubiq: '0x8aE30a7B7F8c43D0b8f5e7f3E6C1e6E1e6E1e6E1',
        energi: '0x1234567890abcdef1234567890abcdef12345678',
        thundercore: '0x0000000000000000000000000000000000000001',
        gochain: '0x0000000000000000000000000000000000000001',
        stipend: 'SPGqC8LZNtMjnvbPjFJbgQrNrJSYKgQm8Y',
        viacoin: 'VhY2vCmshx3vNfJLSNjB8AJTfZR7pGhMFf'
    };
    return testAddresses[coinName];
}

function getBalanceMethod(coinName) {
    const ethLike = ['ethereum', 'conflux', 'expanse', 'ubiq', 'energi', 'thundercore', 'gochain'];
    if (ethLike.includes(coinName)) {
        return 'eth_getBalance';
    }
    return 'getbalance';
}

function getNetworkInfoMethod(coinName) {
    const ethLike = ['ethereum', 'conflux', 'expanse', 'ubiq', 'energi', 'thundercore', 'gochain'];
    if (ethLike.includes(coinName)) {
        return 'eth_blockNumber';
    }
    return 'getnetworkinfo';
}

function getFeeEstimateMethod(coinName) {
    const ethLike = ['ethereum', 'conflux', 'expanse', 'ubiq', 'energi', 'thundercore', 'gochain'];
    if (ethLike.includes(coinName)) {
        return 'eth_gasPrice';
    }
    return 'estimatesmartfee';
}

async function runComprehensiveTest() {
    console.log('🧪 Starting Comprehensive Transaction Test for All Working Endpoints\n');
    console.log('============================================================');
    
    const results = {};
    let totalTests = 0;
    let successfulTests = 0;
    
    for (const [coinName, networks] of Object.entries(WORKING_ENDPOINTS)) {
        results[coinName] = {};
        
        for (const [network, endpoint] of Object.entries(networks)) {
            console.log(`\n🔍 Testing ${coinName} (${network}): ${endpoint}`);
            console.log('-'.repeat(60));
            
            const coinNetworkResults = {
                endpoint,
                tests: {}
            };
            
            // Test 1: Get Balance
            console.log('  📊 Testing balance retrieval...');
            const balanceResult = await testGetBalance(endpoint, coinName, network);
            coinNetworkResults.tests.balance = balanceResult;
            totalTests++;
            if (balanceResult.status === 'success') successfulTests++;
            console.log(`     ${balanceResult.status === 'success' ? '✅' : '❌'} Balance: ${balanceResult.status}`);
            
            // Test 2: Get Transaction History
            console.log('  📝 Testing transaction history...');
            const historyResult = await testGetTransactionHistory(endpoint, coinName, network);
            coinNetworkResults.tests.history = historyResult;
            totalTests++;
            if (historyResult.status === 'success') successfulTests++;
            console.log(`     ${historyResult.status === 'success' ? '✅' : '❌'} History: ${historyResult.status}`);
            
            // Test 3: Get Network Info
            console.log('  🌐 Testing network information...');
            const networkResult = await testGetNetworkInfo(endpoint, coinName, network);
            coinNetworkResults.tests.networkInfo = networkResult;
            totalTests++;
            if (networkResult.status === 'success') successfulTests++;
            console.log(`     ${networkResult.status === 'success' ? '✅' : '❌'} Network Info: ${networkResult.status}`);
            
            // Test 4: Estimate Transaction Fee
            console.log('  💰 Testing fee estimation...');
            const feeResult = await testEstimateFee(endpoint, coinName, network);
            coinNetworkResults.tests.feeEstimate = feeResult;
            totalTests++;
            if (feeResult.status === 'success') successfulTests++;
            console.log(`     ${feeResult.status === 'success' ? '✅' : '❌'} Fee Estimate: ${feeResult.status}`);
            
            results[coinName][network] = coinNetworkResults;
            
            // Calculate success rate for this endpoint
            const endpointTests = Object.values(coinNetworkResults.tests);
            const endpointSuccesses = endpointTests.filter(t => t.status === 'success').length;
            const endpointRate = ((endpointSuccesses / endpointTests.length) * 100).toFixed(1);
            console.log(`     📈 Endpoint Success Rate: ${endpointRate}% (${endpointSuccesses}/${endpointTests.length})`);
        }
    }
    
    // Generate comprehensive summary
    console.log('\n============================================================');
    console.log('📊 COMPREHENSIVE TRANSACTION TEST SUMMARY');
    console.log('============================================================');
    
    const overallSuccessRate = ((successfulTests / totalTests) * 100).toFixed(1);
    console.log(`Total Tests Performed: ${totalTests}`);
    console.log(`Successful Tests: ${successfulTests}`);
    console.log(`Failed Tests: ${totalTests - successfulTests}`);
    console.log(`Overall Success Rate: ${overallSuccessRate}%\n`);
    
    // Detailed endpoint analysis
    console.log('🔍 DETAILED ENDPOINT ANALYSIS:');
    console.log('-'.repeat(50));
    
    for (const [coinName, networks] of Object.entries(results)) {
        for (const [network, data] of Object.entries(networks)) {
            const tests = Object.values(data.tests);
            const successes = tests.filter(t => t.status === 'success').length;
            const rate = ((successes / tests.length) * 100).toFixed(1);
            
            const status = rate === '100.0' ? '🟢' : rate >= '75.0' ? '🟡' : rate >= '50.0' ? '🟠' : '🔴';
            console.log(`${status} ${coinName} (${network}): ${rate}% success (${successes}/${tests.length} tests)`);
            
            // Show failed test details
            const failedTests = Object.entries(data.tests).filter(([_, result]) => result.status === 'failed');
            if (failedTests.length > 0) {
                failedTests.forEach(([testName, result]) => {
                    console.log(`   ❌ ${testName}: ${result.error}`);
                });
            }
        }
    }
    
    // Best performing endpoints
    console.log('\n🏆 BEST PERFORMING ENDPOINTS:');
    console.log('-'.repeat(40));
    
    const endpointPerformance = [];
    for (const [coinName, networks] of Object.entries(results)) {
        for (const [network, data] of Object.entries(networks)) {
            const tests = Object.values(data.tests);
            const successes = tests.filter(t => t.status === 'success').length;
            const rate = (successes / tests.length) * 100;
            
            endpointPerformance.push({
                coin: coinName,
                network,
                endpoint: data.endpoint,
                successRate: rate,
                successes,
                total: tests.length
            });
        }
    }
    
    endpointPerformance
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 10)
        .forEach((ep, index) => {
            console.log(`${index + 1}. ${ep.coin} (${ep.network}): ${ep.successRate.toFixed(1)}% (${ep.successes}/${ep.total})`);
        });
    
    // Save detailed results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `comprehensive-test-results-${timestamp}.json`;
    const filepath = `C:\\Projects\\basic-mining-wallet\\${filename}`;
    
    const reportData = {
        timestamp: new Date().toISOString(),
        summary: {
            totalTests,
            successfulTests,
            failedTests: totalTests - successfulTests,
            overallSuccessRate: parseFloat(overallSuccessRate)
        },
        endpointPerformance,
        detailedResults: results
    };
    
    fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed results saved to: ${filepath}`);
    
    return results;
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);
