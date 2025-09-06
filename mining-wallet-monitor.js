const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Real-time monitoring system for the mining wallet
class MiningWalletMonitor {
    constructor() {
        this.config = {
            // RPC endpoints from our successful tests
            rpcEndpoints: {
                'bitcoin': 'https://bitcoin-rpc.publicnode.com',
                'ethereum': 'https://ethereum-rpc.publicnode.com',
                'conflux': 'https://main.confluxrpc.com',
                'zelcash': 'https://explorer.zel.cash/api',
                'peercoin': 'https://explorer.peercoin.net/api',
                'expanse': 'https://node.expanse.tech',
                'ubiq': 'https://rpc.ubiqscan.io',
                'energi': 'https://nodeapi.energi.network',
                'thundercore': 'https://mainnet-rpc.thundercore.com',
                'gochain': 'https://rpc.gochain.io',
                'stipend': 'https://explorer.stipend.org/api',
                'viacoin': 'https://explorer.viacoin.org/api'
            },
            
            // Testnet endpoints
            testnetEndpoints: {
                'bitcoin': 'https://bitcoin-testnet-rpc.publicnode.com',
                'ethereum': 'https://ethereum-sepolia-rpc.publicnode.com'
            },
            
            // Working mining pools
            miningPools: {
                'bitcoin': 'stratum+tcp://btc-us.f2pool.com:1314',
                'zelcash': 'stratum+tcp://zel.2miners.com:9090'
            },
            
            // Monitoring intervals
            intervals: {
                rpcHealth: 60000,    // 1 minute
                poolHealth: 120000,  // 2 minutes
                systemHealth: 30000, // 30 seconds
                reporting: 300000    // 5 minutes
            },
            
            // Performance thresholds
            thresholds: {
                responseTime: 5000,  // 5 seconds max
                errorRate: 0.1,      // 10% max error rate
                uptime: 0.95         // 95% min uptime
            }
        };
        
        this.stats = {
            rpc: {},
            pools: {},
            system: {
                startTime: Date.now(),
                totalTests: 0,
                successfulTests: 0,
                errors: []
            }
        };
        
        this.isMonitoring = false;
    }
    
    async testRPCEndpoint(endpoint, coinName) {
        const startTime = Date.now();
        
        try {
            let rpcData;
            
            if (endpoint.includes('/api')) {
                // Block explorer API
                const response = await axios.get(`${endpoint}/status`, {
                    timeout: this.config.thresholds.responseTime,
                    headers: { 'User-Agent': 'Mining-Wallet-Monitor/1.0' }
                });
                
                return {
                    status: 'success',
                    responseTime: Date.now() - startTime,
                    data: response.data,
                    timestamp: new Date().toISOString()
                };
            } else {
                // JSON-RPC endpoint
                if (coinName === 'ethereum' || ['conflux', 'expanse', 'ubiq', 'energi', 'thundercore', 'gochain'].includes(coinName)) {
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
                    timeout: this.config.thresholds.responseTime,
                    headers: { 
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mining-Wallet-Monitor/1.0'
                    }
                });
                
                return {
                    status: 'success',
                    responseTime: Date.now() - startTime,
                    blockHeight: response.data.result,
                    timestamp: new Date().toISOString()
                };
            }
            
        } catch (error) {
            return {
                status: 'failed',
                responseTime: Date.now() - startTime,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    async testMiningPool(poolUrl, coinName) {
        const startTime = Date.now();
        
        try {
            // Extract host and port from stratum URL
            const match = poolUrl.match(/stratum\+tcp:\/\/([^:]+):(\d+)/);
            if (!match) {
                throw new Error('Invalid pool URL format');
            }
            
            const [, host, port] = match;
            
            // Test TCP connectivity
            const net = require('net');
            const socket = new net.Socket();
            
            const result = await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    socket.destroy();
                    resolve({
                        status: 'failed',
                        error: 'Connection timeout',
                        responseTime: Date.now() - startTime
                    });
                }, 5000);
                
                socket.connect(parseInt(port), host, () => {
                    clearTimeout(timeout);
                    socket.destroy();
                    resolve({
                        status: 'success',
                        responseTime: Date.now() - startTime
                    });
                });
                
                socket.on('error', (error) => {
                    clearTimeout(timeout);
                    socket.destroy();
                    resolve({
                        status: 'failed',
                        error: error.message,
                        responseTime: Date.now() - startTime
                    });
                });
            });
            
            return {
                ...result,
                timestamp: new Date().toISOString(),
                host,
                port: parseInt(port)
            };
            
        } catch (error) {
            return {
                status: 'failed',
                error: error.message,
                responseTime: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    async performHealthCheck() {
        console.log(`🔍 Health Check - ${new Date().toLocaleTimeString()}`);
        console.log('-'.repeat(50));
        
        const healthReport = {
            timestamp: new Date().toISOString(),
            rpc: {},
            pools: {},
            summary: {
                rpcHealth: 0,
                poolHealth: 0,
                overallHealth: 0
            }
        };
        
        // Test RPC endpoints
        let rpcSuccesses = 0;
        let rpcTotal = Object.keys(this.config.rpcEndpoints).length;
        
        for (const [coinName, endpoint] of Object.entries(this.config.rpcEndpoints)) {
            const result = await this.testRPCEndpoint(endpoint, coinName);
            healthReport.rpc[coinName] = result;
            
            if (result.status === 'success') {
                rpcSuccesses++;
            }
            
            // Update stats
            if (!this.stats.rpc[coinName]) {
                this.stats.rpc[coinName] = {
                    totalTests: 0,
                    successes: 0,
                    failures: 0,
                    avgResponseTime: 0,
                    lastSuccess: null,
                    lastFailure: null
                };
            }
            
            this.stats.rpc[coinName].totalTests++;
            if (result.status === 'success') {
                this.stats.rpc[coinName].successes++;
                this.stats.rpc[coinName].lastSuccess = result.timestamp;
            } else {
                this.stats.rpc[coinName].failures++;
                this.stats.rpc[coinName].lastFailure = result.timestamp;
            }
            
            console.log(`  ${result.status === 'success' ? '✅' : '❌'} RPC ${coinName}: ${result.status} (${result.responseTime}ms)`);
        }
        
        // Test mining pools
        let poolSuccesses = 0;
        let poolTotal = Object.keys(this.config.miningPools).length;
        
        for (const [coinName, poolUrl] of Object.entries(this.config.miningPools)) {
            const result = await this.testMiningPool(poolUrl, coinName);
            healthReport.pools[coinName] = result;
            
            if (result.status === 'success') {
                poolSuccesses++;
            }
            
            // Update stats
            if (!this.stats.pools[coinName]) {
                this.stats.pools[coinName] = {
                    totalTests: 0,
                    successes: 0,
                    failures: 0,
                    avgResponseTime: 0,
                    lastSuccess: null,
                    lastFailure: null
                };
            }
            
            this.stats.pools[coinName].totalTests++;
            if (result.status === 'success') {
                this.stats.pools[coinName].successes++;
                this.stats.pools[coinName].lastSuccess = result.timestamp;
            } else {
                this.stats.pools[coinName].failures++;
                this.stats.pools[coinName].lastFailure = result.timestamp;
            }
            
            console.log(`  ${result.status === 'success' ? '✅' : '❌'} Pool ${coinName}: ${result.status} (${result.responseTime}ms)`);
        }
        
        // Calculate health metrics
        healthReport.summary.rpcHealth = rpcTotal > 0 ? (rpcSuccesses / rpcTotal) : 0;
        healthReport.summary.poolHealth = poolTotal > 0 ? (poolSuccesses / poolTotal) : 0;
        healthReport.summary.overallHealth = ((rpcSuccesses + poolSuccesses) / (rpcTotal + poolTotal));
        
        console.log(`\n📊 Health Summary:`);
        console.log(`   RPC Health: ${(healthReport.summary.rpcHealth * 100).toFixed(1)}% (${rpcSuccesses}/${rpcTotal})`);
        console.log(`   Pool Health: ${(healthReport.summary.poolHealth * 100).toFixed(1)}% (${poolSuccesses}/${poolTotal})`);
        console.log(`   Overall Health: ${(healthReport.summary.overallHealth * 100).toFixed(1)}%`);
        
        // Update system stats
        this.stats.system.totalTests++;
        if (healthReport.summary.overallHealth >= this.config.thresholds.uptime) {
            this.stats.system.successfulTests++;
        }
        
        return healthReport;
    }
    
    generateStatusReport() {
        const uptime = Date.now() - this.stats.system.startTime;
        const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);
        
        console.log('\n============================================================');
        console.log('📈 MINING WALLET SYSTEM STATUS REPORT');
        console.log('============================================================');
        
        console.log(`\n🕒 System Uptime: ${uptimeHours} hours`);
        console.log(`🧪 Total Health Checks: ${this.stats.system.totalTests}`);
        console.log(`✅ Successful Checks: ${this.stats.system.successfulTests}`);
        
        const systemSuccessRate = this.stats.system.totalTests > 0 ? 
            (this.stats.system.successfulTests / this.stats.system.totalTests * 100).toFixed(1) : '0.0';
        console.log(`📊 System Success Rate: ${systemSuccessRate}%`);
        
        console.log('\n🌐 RPC ENDPOINT STATUS:');
        console.log('-'.repeat(30));
        
        for (const [coinName, stats] of Object.entries(this.stats.rpc)) {
            const successRate = stats.totalTests > 0 ? (stats.successes / stats.totalTests * 100).toFixed(1) : '0.0';
            const avgResponseTime = stats.totalTests > 0 ? 
                Math.round(stats.avgResponseTime / stats.totalTests) : 0;
            
            const healthIcon = parseFloat(successRate) >= 95 ? '🟢' : 
                              parseFloat(successRate) >= 80 ? '🟡' : 
                              parseFloat(successRate) >= 50 ? '🟠' : '🔴';
            
            console.log(`${healthIcon} ${coinName}: ${successRate}% success (${stats.successes}/${stats.totalTests})`);
            if (stats.lastSuccess) {
                console.log(`   📅 Last Success: ${new Date(stats.lastSuccess).toLocaleString()}`);
            }
            if (stats.lastFailure) {
                console.log(`   ⚠️  Last Failure: ${new Date(stats.lastFailure).toLocaleString()}`);
            }
        }
        
        console.log('\n🏊 MINING POOL STATUS:');
        console.log('-'.repeat(25));
        
        for (const [coinName, stats] of Object.entries(this.stats.pools)) {
            const successRate = stats.totalTests > 0 ? (stats.successes / stats.totalTests * 100).toFixed(1) : '0.0';
            
            const healthIcon = parseFloat(successRate) >= 95 ? '🟢' : 
                              parseFloat(successRate) >= 80 ? '🟡' : 
                              parseFloat(successRate) >= 50 ? '🟠' : '🔴';
            
            console.log(`${healthIcon} ${coinName}: ${successRate}% success (${stats.successes}/${stats.totalTests})`);
            if (stats.lastSuccess) {
                console.log(`   📅 Last Success: ${new Date(stats.lastSuccess).toLocaleString()}`);
            }
        }
    }
    
    async startMonitoring(duration = 300000) { // Default 5 minutes
        console.log('🚀 Starting Real-Time Mining Wallet Monitoring');
        console.log(`⏱️  Monitoring for ${duration / 1000} seconds...\n`);
        console.log('============================================================');
        
        this.isMonitoring = true;
        const startTime = Date.now();
        
        // Perform initial health check
        await this.performHealthCheck();
        
        // Set up periodic health checks
        const healthCheckInterval = setInterval(async () => {
            if (!this.isMonitoring || Date.now() - startTime >= duration) {
                clearInterval(healthCheckInterval);
                this.isMonitoring = false;
                
                console.log('\n⏹️  Monitoring stopped');
                this.generateStatusReport();
                
                // Save final report
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const reportFile = `monitoring-report-${timestamp}.json`;
                
                const finalReport = {
                    monitoringSession: {
                        startTime: new Date(this.stats.system.startTime).toISOString(),
                        endTime: new Date().toISOString(),
                        duration: Date.now() - this.stats.system.startTime,
                        durationMinutes: (Date.now() - this.stats.system.startTime) / 60000
                    },
                    stats: this.stats,
                    config: this.config
                };
                
                fs.writeFileSync(reportFile, JSON.stringify(finalReport, null, 2));
                console.log(`\n📄 Final monitoring report saved to: ${reportFile}`);
                
                return;
            }
            
            await this.performHealthCheck();
            
        }, this.config.intervals.systemHealth);
        
        // Keep the process running
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }
    
    async runSingleHealthCheck() {
        console.log('🏥 Running Single Health Check\n');
        console.log('============================================================');
        
        const healthReport = await this.performHealthCheck();
        
        // Save health report
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFile = `health-check-${timestamp}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(healthReport, null, 2));
        
        console.log(`\n📄 Health check report saved to: ${reportFile}`);
        
        return healthReport;
    }
}

// Main execution
async function main() {
    const monitor = new MiningWalletMonitor();
    
    console.log('💡 Mining Wallet Health Monitor');
    console.log('================================');
    console.log('1. Single Health Check (quick)');
    console.log('2. 5-Minute Monitoring Session');
    console.log('3. 15-Minute Monitoring Session');
    
    // For demonstration, run a single health check
    const healthReport = await monitor.runSingleHealthCheck();
    
    // Show recommendations based on health
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-'.repeat(20));
    
    if (healthReport.summary.overallHealth >= 0.95) {
        console.log('🟢 System is healthy - ready for production');
        console.log('✅ All systems operational');
        console.log('🚀 You can proceed with mining operations');
    } else if (healthReport.summary.overallHealth >= 0.8) {
        console.log('🟡 System is mostly healthy with minor issues');
        console.log('⚠️  Monitor failing endpoints closely');
        console.log('🔧 Consider backup endpoints for failing services');
    } else if (healthReport.summary.overallHealth >= 0.5) {
        console.log('🟠 System has significant issues');
        console.log('⚠️  Multiple endpoints failing');
        console.log('🔧 Immediate attention required');
        console.log('🚨 Consider implementing failover logic');
    } else {
        console.log('🔴 System is critically unhealthy');
        console.log('🚨 Major infrastructure issues detected');
        console.log('🔧 Immediate intervention required');
        console.log('⏸️  Consider pausing operations until resolved');
    }
    
    console.log('\n🎯 NEXT ACTIONS:');
    console.log('1. 📊 Review detailed health reports');
    console.log('2. 🔧 Address any failing endpoints');
    console.log('3. 🚀 Proceed with mining integration');
    console.log('4. 📈 Set up continuous monitoring');
}

// Run the monitoring system
main().catch(console.error);
