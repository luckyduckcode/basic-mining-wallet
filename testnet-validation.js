const axios = require('axios');
const fs = require('fs');

// Testnet endpoints to validate
const TESTNET_ENDPOINTS = {
    bitcoin: {
        testnet: 'https://bitcoin-testnet-rpc.publicnode.com',
        faucet: 'https://coinfaucet.eu/en/btc-testnet/',
        explorer: 'https://blockstream.info/testnet/'
    },
    // Add more testnet configurations as we discover them
    ethereum: {
        testnet: 'https://ethereum-goerli-rpc.publicnode.com',
        sepolia: 'https://ethereum-sepolia-rpc.publicnode.com',
        faucet: 'https://faucets.chain.link/',
        explorer: 'https://goerli.etherscan.io/'
    }
};

// Alternative testnet endpoints to try
const ALTERNATIVE_TESTNETS = {
    bitcoin: [
        'https://bitcoin-testnet-rpc.publicnode.com',
        'https://testnet3.btc.org',
        'https://testnet.bitcoin.org',
        'https://api.blockcypher.com/v1/btc/test3'
    ],
    ethereum: [
        'https://ethereum-goerli-rpc.publicnode.com',
        'https://ethereum-sepolia-rpc.publicnode.com',
        'https://rpc.ankr.com/eth_goerli',
        'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
    ],
    litecoin: [
        'https://litecoin-testnet-rpc.publicnode.com',
        'https://testnet-api.ltc.org'
    ],
    dogecoin: [
        'https://dogecoin-testnet-rpc.publicnode.com'
    ]
};

async function testTestnetConnectivity(endpoint, coinName) {
    try {
        // Try basic connectivity test
        let rpcData;
        
        if (coinName === 'ethereum') {
            rpcData = {
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1
            };
        } else {
            rpcData = {
                jsonrpc: '2.0',
                method: 'getblockchaininfo',
                params: [],
                id: 1
            };
        }
        
        const response = await axios.post(endpoint, rpcData, {
            timeout: 10000,
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Mining-Wallet-Testnet-Test/1.0'
            }
        });
        
        return {
            status: 'success',
            result: response.data.result,
            responseTime: Date.now()
        };
    } catch (error) {
        return {
            status: 'failed',
            error: error.message,
            responseTime: Date.now()
        };
    }
}

async function testFaucetAccess(faucetUrl, coinName) {
    try {
        const response = await axios.get(faucetUrl, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mining-Wallet-Testnet-Test/1.0' }
        });
        
        return {
            status: 'accessible',
            statusCode: response.status,
            available: response.status === 200,
            responseTime: Date.now()
        };
    } catch (error) {
        return {
            status: 'failed',
            error: error.message,
            available: false,
            responseTime: Date.now()
        };
    }
}

async function testExplorerAccess(explorerUrl, coinName) {
    try {
        const response = await axios.get(explorerUrl, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mining-Wallet-Testnet-Test/1.0' }
        });
        
        return {
            status: 'accessible',
            statusCode: response.status,
            available: response.status === 200,
            responseTime: Date.now()
        };
    } catch (error) {
        return {
            status: 'failed',
            error: error.message,
            available: false,
            responseTime: Date.now()
        };
    }
}

async function discoverWorkingTestnets() {
    console.log('🔍 Discovering Working Testnet Endpoints\n');
    console.log('============================================================');
    
    const results = {};
    
    for (const [coinName, endpoints] of Object.entries(ALTERNATIVE_TESTNETS)) {
        console.log(`\n🪙 Testing ${coinName.toUpperCase()} testnets:`);
        console.log('-'.repeat(50));
        
        results[coinName] = {
            workingEndpoints: [],
            failedEndpoints: []
        };
        
        for (const endpoint of endpoints) {
            console.log(`  📡 Testing: ${endpoint}`);
            const result = await testTestnetConnectivity(endpoint, coinName);
            
            if (result.status === 'success') {
                console.log(`     ✅ SUCCESS - Testnet is responsive`);
                results[coinName].workingEndpoints.push({
                    endpoint,
                    result: result.result,
                    tested: new Date().toISOString()
                });
            } else {
                console.log(`     ❌ FAILED - ${result.error}`);
                results[coinName].failedEndpoints.push({
                    endpoint,
                    error: result.error,
                    tested: new Date().toISOString()
                });
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const workingCount = results[coinName].workingEndpoints.length;
        const totalCount = endpoints.length;
        console.log(`     📊 ${coinName} Success Rate: ${((workingCount/totalCount)*100).toFixed(1)}% (${workingCount}/${totalCount})`);
    }
    
    return results;
}

async function testTestnetInfrastructure() {
    console.log('🧪 Testing Complete Testnet Infrastructure\n');
    console.log('============================================================');
    
    const infrastructureResults = {};
    
    for (const [coinName, config] of Object.entries(TESTNET_ENDPOINTS)) {
        console.log(`\n🔧 Testing ${coinName.toUpperCase()} testnet infrastructure:`);
        console.log('-'.repeat(55));
        
        const coinResults = {
            rpc: {},
            faucet: {},
            explorer: {}
        };
        
        // Test RPC endpoint
        if (config.testnet) {
            console.log(`  🌐 Testing RPC: ${config.testnet}`);
            const rpcResult = await testTestnetConnectivity(config.testnet, coinName);
            coinResults.rpc = rpcResult;
            console.log(`     ${rpcResult.status === 'success' ? '✅' : '❌'} RPC: ${rpcResult.status}`);
        }
        
        // Test additional networks (like Sepolia for Ethereum)
        if (config.sepolia) {
            console.log(`  🌐 Testing Sepolia: ${config.sepolia}`);
            const sepoliaResult = await testTestnetConnectivity(config.sepolia, coinName);
            coinResults.sepolia = sepoliaResult;
            console.log(`     ${sepoliaResult.status === 'success' ? '✅' : '❌'} Sepolia: ${sepoliaResult.status}`);
        }
        
        // Test faucet access
        if (config.faucet) {
            console.log(`  💧 Testing Faucet: ${config.faucet}`);
            const faucetResult = await testFaucetAccess(config.faucet, coinName);
            coinResults.faucet = faucetResult;
            console.log(`     ${faucetResult.available ? '✅' : '❌'} Faucet: ${faucetResult.status}`);
        }
        
        // Test explorer access
        if (config.explorer) {
            console.log(`  🔍 Testing Explorer: ${config.explorer}`);
            const explorerResult = await testExplorerAccess(config.explorer, coinName);
            coinResults.explorer = explorerResult;
            console.log(`     ${explorerResult.available ? '✅' : '❌'} Explorer: ${explorerResult.status}`);
        }
        
        infrastructureResults[coinName] = coinResults;
        
        // Calculate infrastructure health
        const services = Object.values(coinResults);
        const healthyServices = services.filter(service => 
            service.status === 'success' || service.available === true
        ).length;
        const healthPercentage = ((healthyServices / services.length) * 100).toFixed(1);
        console.log(`     📊 Infrastructure Health: ${healthPercentage}% (${healthyServices}/${services.length} services)`);
        
        // Small delay between coin tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return infrastructureResults;
}

async function generateTestnetRecommendations(discoveryResults, infrastructureResults) {
    console.log('\n============================================================');
    console.log('📋 TESTNET VALIDATION SUMMARY & RECOMMENDATIONS');
    console.log('============================================================');
    
    // Summary statistics
    let totalEndpointsTested = 0;
    let totalWorkingEndpoints = 0;
    
    for (const coinResults of Object.values(discoveryResults)) {
        totalEndpointsTested += coinResults.workingEndpoints.length + coinResults.failedEndpoints.length;
        totalWorkingEndpoints += coinResults.workingEndpoints.length;
    }
    
    const overallTestnetSuccess = totalEndpointsTested > 0 ? 
        ((totalWorkingEndpoints / totalEndpointsTested) * 100).toFixed(1) : '0.0';
    
    console.log(`\n📊 DISCOVERY RESULTS:`);
    console.log(`Total Testnet Endpoints Tested: ${totalEndpointsTested}`);
    console.log(`Working Testnet Endpoints: ${totalWorkingEndpoints}`);
    console.log(`Testnet Success Rate: ${overallTestnetSuccess}%`);
    
    // Best testnet endpoints
    console.log(`\n🏆 RECOMMENDED TESTNET ENDPOINTS:`);
    console.log('-'.repeat(45));
    
    for (const [coinName, results] of Object.entries(discoveryResults)) {
        if (results.workingEndpoints.length > 0) {
            console.log(`\n${coinName.toUpperCase()}:`);
            results.workingEndpoints.forEach((endpoint, index) => {
                console.log(`  ${index + 1}. ${endpoint.endpoint}`);
            });
        }
    }
    
    // Infrastructure recommendations
    console.log(`\n🔧 TESTNET INFRASTRUCTURE STATUS:`);
    console.log('-'.repeat(40));
    
    for (const [coinName, infrastructure] of Object.entries(infrastructureResults)) {
        const services = Object.entries(infrastructure);
        const healthyServices = services.filter(([_, service]) => 
            service.status === 'success' || service.available === true
        ).length;
        
        const healthIcon = healthyServices === services.length ? '🟢' : 
                          healthyServices >= services.length * 0.5 ? '🟡' : '🔴';
        
        console.log(`${healthIcon} ${coinName.toUpperCase()}: ${healthyServices}/${services.length} services working`);
        
        services.forEach(([serviceName, serviceResult]) => {
            const status = serviceResult.status === 'success' || serviceResult.available === true ? '✅' : '❌';
            console.log(`   ${status} ${serviceName}: ${serviceResult.status || 'unavailable'}`);
        });
    }
    
    // Development recommendations
    console.log(`\n🚀 DEVELOPMENT RECOMMENDATIONS:`);
    console.log('-'.repeat(38));
    
    if (totalWorkingEndpoints > 0) {
        console.log('✅ Testnet connectivity is available for development');
        console.log('✅ You can proceed with testnet integration');
        console.log('✅ Focus on the recommended endpoints above');
        
        if (discoveryResults.bitcoin?.workingEndpoints.length > 0) {
            console.log('🪙 Bitcoin testnet is ready for transaction testing');
        }
        
        if (discoveryResults.ethereum?.workingEndpoints.length > 0) {
            console.log('🪙 Ethereum testnet is ready for smart contract testing');
        }
    } else {
        console.log('⚠️  No working testnet endpoints found');
        console.log('⚠️  Consider using mainnet with small amounts for testing');
        console.log('⚠️  Or research additional testnet providers');
    }
    
    return {
        totalEndpointsTested,
        totalWorkingEndpoints,
        overallTestnetSuccess: parseFloat(overallTestnetSuccess),
        discoveryResults,
        infrastructureResults
    };
}

async function runTestnetValidation() {
    console.log('🌐 Starting Comprehensive Testnet Validation\n');
    
    try {
        // Phase 1: Discover working testnet endpoints
        const discoveryResults = await discoverWorkingTestnets();
        
        // Phase 2: Test complete testnet infrastructure
        const infrastructureResults = await testTestnetInfrastructure();
        
        // Phase 3: Generate recommendations
        const summary = await generateTestnetRecommendations(discoveryResults, infrastructureResults);
        
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `testnet-validation-results-${timestamp}.json`;
        const filepath = `C:\\Projects\\basic-mining-wallet\\${filename}`;
        
        const reportData = {
            timestamp: new Date().toISOString(),
            summary,
            discoveryResults,
            infrastructureResults
        };
        
        fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));
        console.log(`\n📄 Detailed testnet validation results saved to: ${filepath}`);
        
        return summary;
        
    } catch (error) {
        console.error('❌ Error during testnet validation:', error);
        return null;
    }
}

// Run the testnet validation
runTestnetValidation().catch(console.error);
