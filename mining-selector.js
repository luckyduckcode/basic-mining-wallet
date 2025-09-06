const axios = require('axios');
const fs = require('fs');

class MiningSelector {
    constructor() {
        this.supportedCoins = {
            // Tier 1 - 100% Functional
            'bitcoin': {
                name: 'Bitcoin',
                symbol: 'BTC',
                algorithm: 'sha256',
                difficulty: 'Very High',
                powerConsumption: 'High',
                profitability: 'High',
                stability: 'Very High',
                pools: [
                    'stratum+tcp://btc-us.f2pool.com:1314',
                    'stratum+tcp://pool.bitcoin.com:3333'
                ],
                walletAddress: '1KkrieZqZrSZaUKDBSYCum8SFpBzsk4wnw',
                rpcEndpoint: 'https://bitcoin-rpc.publicnode.com',
                minPayout: 0.001,
                avgBlockTime: 600, // seconds
                marketCapRank: 1,
                recommendedFor: ['ASIC', 'High-end GPU'],
                electricityCost: 'Medium-High'
            },
            
            'zelcash': {
                name: 'Zelcash (Flux)',
                symbol: 'ZEL',
                algorithm: 'equihash_125_4',
                difficulty: 'Medium',
                powerConsumption: 'Medium',
                profitability: 'Very High',
                stability: 'High',
                pools: [
                    'stratum+tcp://zel.2miners.com:9090',
                    'stratum+tcp://flux.herominers.com:1010'
                ],
                walletAddress: '2H3MzoypWYiTj14qY47fCSP9ooh7heFtctS',
                rpcEndpoint: 'https://explorer.zel.cash/api',
                minPayout: 1.0,
                avgBlockTime: 120,
                marketCapRank: 85,
                recommendedFor: ['GPU', 'Mid-range ASIC'],
                electricityCost: 'Low-Medium'
            },
            
            'peercoin': {
                name: 'Peercoin',
                symbol: 'PPC',
                algorithm: 'sha256',
                difficulty: 'Low',
                powerConsumption: 'Low',
                profitability: 'Medium',
                stability: 'High',
                pools: [
                    'stratum+tcp://ppc.coinotron.com:3334'
                ],
                walletAddress: 'PGtCNeAnT3Sdcu49FFHF1nr7A2ZgCWuVbK',
                rpcEndpoint: 'https://explorer.peercoin.net/api',
                minPayout: 10.0,
                avgBlockTime: 600,
                marketCapRank: 180,
                recommendedFor: ['Entry-level GPU', 'CPU'],
                electricityCost: 'Very Low'
            },
            
            'stipend': {
                name: 'Stipend',
                symbol: 'SPD',
                algorithm: 'x11',
                difficulty: 'Very Low',
                powerConsumption: 'Low',
                profitability: 'Low-Medium',
                stability: 'Medium',
                pools: [
                    'stratum+tcp://x11.pool.com:3573'
                ],
                walletAddress: 'SZ2Wi3buKvesQKYFz2sjpa9XxhCsAbmiAq',
                rpcEndpoint: 'https://explorer.stipend.org/api',
                minPayout: 100.0,
                avgBlockTime: 60,
                marketCapRank: 1500,
                recommendedFor: ['Any GPU', 'CPU'],
                electricityCost: 'Very Low'
            },
            
            'viacoin': {
                name: 'Viacoin',
                symbol: 'VIA',
                algorithm: 'scrypt',
                difficulty: 'Medium',
                powerConsumption: 'Medium',
                profitability: 'Medium',
                stability: 'Medium',
                pools: [
                    'stratum+tcp://via.pool.com:3333'
                ],
                walletAddress: 'Vn9HHXUqtQN1eMcQ6CegnpAr1rupXCkDDq',
                rpcEndpoint: 'https://explorer.viacoin.org/api',
                minPayout: 50.0,
                avgBlockTime: 24,
                marketCapRank: 800,
                recommendedFor: ['GPU', 'ASIC'],
                electricityCost: 'Medium'
            }
        };

        this.hardwareProfiles = {
            'high-end-gpu': {
                name: 'High-End GPU (RTX 4090, etc.)',
                powerLimit: 450, // watts
                hashrates: {
                    'sha256': 100, // MH/s
                    'equihash_125_4': 150,
                    'ethash': 120,
                    'x11': 80,
                    'scrypt': 900
                },
                electricityCostPerHour: 0.05 // USD
            },
            
            'mid-range-gpu': {
                name: 'Mid-Range GPU (RTX 3070, RX 6700 XT, etc.)',
                powerLimit: 220,
                hashrates: {
                    'sha256': 60,
                    'equihash_125_4': 85,
                    'ethash': 62,
                    'x11': 45,
                    'scrypt': 500
                },
                electricityCostPerHour: 0.025
            },
            
            'entry-level-gpu': {
                name: 'Entry-Level GPU (GTX 1660, RX 580, etc.)',
                powerLimit: 150,
                hashrates: {
                    'sha256': 35,
                    'equihash_125_4': 45,
                    'ethash': 32,
                    'x11': 25,
                    'scrypt': 250
                },
                electricityCostPerHour: 0.015
            },
            
            'asic': {
                name: 'ASIC Miner',
                powerLimit: 3000,
                hashrates: {
                    'sha256': 100000, // TH/s for ASIC
                    'equihash_125_4': 10000,
                    'scrypt': 50000
                },
                electricityCostPerHour: 0.30
            }
        };
    }

    async getPricingData() {
        console.log('📊 Fetching current cryptocurrency prices...');
        
        const prices = {};
        const symbols = Object.values(this.supportedCoins).map(coin => coin.symbol);
        
        try {
            // Using CoinGecko API for price data
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
                params: {
                    ids: 'bitcoin,flux,peercoin,stipend,viacoin',
                    vs_currencies: 'usd',
                    include_24hr_change: true
                },
                timeout: 10000
            });
            
            // Map the response to our coin symbols
            const priceMap = {
                'BTC': response.data.bitcoin?.usd || 45000,
                'ZEL': response.data.flux?.usd || 0.50,
                'PPC': response.data.peercoin?.usd || 0.35,
                'SPD': 0.01, // Fallback for smaller coins
                'VIA': response.data.viacoin?.usd || 0.15
            };

            for (const [coinId, coin] of Object.entries(this.supportedCoins)) {
                prices[coinId] = {
                    price: priceMap[coin.symbol] || 0.01,
                    change24h: 0,
                    lastUpdated: new Date().toISOString()
                };
            }

            console.log('✅ Price data fetched successfully');
            
        } catch (error) {
            console.log('⚠️  Using fallback pricing data due to API error');
            
            // Fallback prices
            for (const [coinId, coin] of Object.entries(this.supportedCoins)) {
                const fallbackPrices = {
                    'bitcoin': 45000,
                    'zelcash': 0.50,
                    'peercoin': 0.35,
                    'stipend': 0.01,
                    'viacoin': 0.15
                };
                
                prices[coinId] = {
                    price: fallbackPrices[coinId] || 0.01,
                    change24h: 0,
                    lastUpdated: new Date().toISOString(),
                    source: 'fallback'
                };
            }
        }
        
        return prices;
    }

    calculateProfitability(coinId, hardwareProfile, prices, electricityRate = 0.10) {
        const coin = this.supportedCoins[coinId];
        const hardware = this.hardwareProfiles[hardwareProfile];
        const price = prices[coinId].price;
        
        if (!hardware.hashrates[coin.algorithm]) {
            return null; // Hardware not compatible with algorithm
        }
        
        const hashrate = hardware.hashrates[coin.algorithm];
        const powerConsumption = hardware.powerLimit / 1000; // Convert to kW
        const electricityCostPerHour = powerConsumption * electricityRate;
        
        // Simplified profitability calculation
        // In reality, you'd need network difficulty, block rewards, etc.
        const estimatedRevenuePerHour = hashrate * price * 0.0001; // Rough estimate
        const profitPerHour = estimatedRevenuePerHour - electricityCostPerHour;
        const dailyProfit = profitPerHour * 24;
        const monthlyProfit = dailyProfit * 30;
        
        return {
            coinId,
            coinName: coin.name,
            algorithm: coin.algorithm,
            hashrate,
            estimatedRevenuePerHour,
            electricityCostPerHour,
            profitPerHour,
            dailyProfit,
            monthlyProfit,
            roi: monthlyProfit > 0 ? (hardware.powerLimit * 0.5) / monthlyProfit : -1, // Rough ROI in months
            compatibility: 'compatible'
        };
    }

    generateRecommendations(hardwareProfile, electricityRate = 0.10, preferences = {}) {
        console.log('\n🎯 Generating Mining Recommendations...');
        console.log('======================================');
        
        const hardware = this.hardwareProfiles[hardwareProfile];
        if (!hardware) {
            console.log('❌ Invalid hardware profile');
            return null;
        }
        
        console.log(`🖥️  Hardware: ${hardware.name}`);
        console.log(`⚡ Power Limit: ${hardware.powerLimit}W`);
        console.log(`💰 Electricity Rate: $${electricityRate}/kWh`);
        
        return new Promise(async (resolve) => {
            const prices = await this.getPricingData();
            const recommendations = [];
            
            for (const coinId of Object.keys(this.supportedCoins)) {
                const profitability = this.calculateProfitability(coinId, hardwareProfile, prices, electricityRate);
                
                if (profitability) {
                    recommendations.push(profitability);
                }
            }
            
            // Sort by profitability
            recommendations.sort((a, b) => b.dailyProfit - a.dailyProfit);
            
            console.log('\n📊 PROFITABILITY ANALYSIS:');
            console.log('=========================');
            
            recommendations.forEach((rec, index) => {
                const profitIcon = rec.dailyProfit > 5 ? '🟢' : rec.dailyProfit > 1 ? '🟡' : rec.dailyProfit > 0 ? '🟠' : '🔴';
                const coin = this.supportedCoins[rec.coinId];
                
                console.log(`\n${index + 1}. ${profitIcon} ${rec.coinName} (${coin.symbol})`);
                console.log(`   Algorithm: ${rec.algorithm}`);
                console.log(`   Hashrate: ${rec.hashrate.toLocaleString()} ${rec.algorithm === 'sha256' ? 'MH/s' : 'MH/s'}`);
                console.log(`   Daily Profit: $${rec.dailyProfit.toFixed(2)}`);
                console.log(`   Monthly Profit: $${rec.monthlyProfit.toFixed(2)}`);
                console.log(`   Electricity Cost: $${(rec.electricityCostPerHour * 24).toFixed(2)}/day`);
                console.log(`   Stability: ${coin.stability}`);
                console.log(`   Wallet: ${coin.walletAddress}`);
                
                if (rec.roi > 0) {
                    console.log(`   ROI: ${rec.roi.toFixed(1)} months`);
                }
            });
            
            // Generate specific recommendations
            console.log('\n🎯 RECOMMENDATIONS:');
            console.log('==================');
            
            const topPick = recommendations[0];
            if (topPick && topPick.dailyProfit > 0) {
                console.log(`🥇 TOP PICK: ${topPick.coinName}`);
                console.log(`   Best profitability with $${topPick.dailyProfit.toFixed(2)}/day profit`);
                console.log(`   Start mining: npm run ui (then click Start for ${topPick.coinId})`);
            }
            
            const safePick = recommendations.find(r => 
                this.supportedCoins[r.coinId].stability === 'Very High' || 
                this.supportedCoins[r.coinId].stability === 'High'
            );
            
            if (safePick) {
                console.log(`\n🛡️  SAFE PICK: ${safePick.coinName}`);
                console.log(`   Most stable option with consistent returns`);
                console.log(`   Daily Profit: $${safePick.dailyProfit.toFixed(2)}`);
            }
            
            const beginnerPick = recommendations.find(r => 
                this.supportedCoins[r.coinId].electricityCost === 'Very Low' ||
                this.supportedCoins[r.coinId].electricityCost === 'Low'
            );
            
            if (beginnerPick) {
                console.log(`\n🌱 BEGINNER PICK: ${beginnerPick.coinName}`);
                console.log(`   Low power consumption and easy to start`);
                console.log(`   Daily Profit: $${beginnerPick.dailyProfit.toFixed(2)}`);
            }
            
            resolve({
                hardware: hardware.name,
                electricityRate,
                recommendations,
                topPick,
                safePick,
                beginnerPick,
                totalCoinsAnalyzed: recommendations.length,
                profitableCoins: recommendations.filter(r => r.dailyProfit > 0).length
            });
        });
    }

    async interactiveMiningSelection() {
        console.log('🚀 INTERACTIVE MINING SELECTION WIZARD');
        console.log('======================================');
        
        console.log('\n🖥️  Available Hardware Profiles:');
        Object.entries(this.hardwareProfiles).forEach(([key, profile], index) => {
            console.log(`${index + 1}. ${profile.name} (${profile.powerLimit}W)`);
        });
        
        // For demo, we'll use mid-range GPU
        const selectedHardware = 'mid-range-gpu';
        console.log(`\n✅ Using: ${this.hardwareProfiles[selectedHardware].name}`);
        
        console.log('\n💡 Electricity Rate Examples:');
        console.log('- Very Low: $0.05/kWh (hydroelectric regions)');
        console.log('- Low: $0.08/kWh (renewable energy)');
        console.log('- Average: $0.12/kWh (US average)');
        console.log('- High: $0.20/kWh (peak rates)');
        
        // For demo, we'll use average rate
        const electricityRate = 0.12;
        console.log(`\n✅ Using: $${electricityRate}/kWh (Average rate)`);
        
        const analysis = await this.generateRecommendations(selectedHardware, electricityRate);
        
        // Save analysis to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `mining-selection-analysis-${timestamp}.json`;
        
        const reportData = {
            timestamp: new Date().toISOString(),
            hardwareProfile: selectedHardware,
            electricityRate,
            analysis,
            supportedCoins: this.supportedCoins,
            quickStart: {
                topRecommendation: analysis.topPick,
                startCommand: `npm run ui`,
                dashboardUrl: 'http://localhost:3000',
                walletAddress: analysis.topPick ? this.supportedCoins[analysis.topPick.coinId].walletAddress : null
            }
        };
        
        fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
        console.log(`\n📄 Analysis saved to: ${filename}`);
        
        return analysis;
    }

    generateQuickStartScript(topPick) {
        if (!topPick) return null;
        
        const coin = this.supportedCoins[topPick.coinId];
        const scriptContent = `@echo off
echo 🚀 Starting ${coin.name} Mining
echo ===============================
echo.
echo 💎 Coin: ${coin.name} (${coin.symbol})
echo ⚙️  Algorithm: ${coin.algorithm}
echo 👛 Wallet: ${coin.walletAddress}
echo 📈 Expected Daily Profit: $${topPick.dailyProfit.toFixed(2)}
echo.
echo Starting GMiner...
echo.

cd /d C:\\GMiner
gminer.exe --algo ${coin.algorithm} --server ${coin.pools[0]} --user ${coin.walletAddress} --pass x --intensity auto --temp_limit 85 --pl 80

pause`;
        
        const filename = `start-${topPick.coinId}-mining.bat`;
        fs.writeFileSync(filename, scriptContent);
        console.log(`\n🚀 Quick start script created: ${filename}`);
        console.log(`   Double-click this file to start mining ${coin.name}!`);
        
        return filename;
    }
}

// Main execution
async function runMiningSelection() {
    const selector = new MiningSelector();
    
    try {
        const analysis = await selector.interactiveMiningSelection();
        
        if (analysis.topPick) {
            const scriptFile = selector.generateQuickStartScript(analysis.topPick);
        }
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('==============');
        console.log('1. 📥 Install GMiner if not already done');
        console.log('2. 🌐 Start web dashboard: npm run ui');
        console.log('3. 📊 Visit: http://localhost:3000');
        console.log('4. 🚀 Click Start for your chosen cryptocurrency');
        console.log('5. 💰 Monitor your mining rewards!');
        
        if (analysis.profitableCoins === 0) {
            console.log('\n⚠️  PROFIT WARNING:');
            console.log('===================');
            console.log('Current electricity rates may make mining unprofitable.');
            console.log('Consider:');
            console.log('- Lower electricity rates');
            console.log('- More efficient hardware');
            console.log('- Mining during off-peak hours');
        }
        
        return analysis;
        
    } catch (error) {
        console.error('❌ Mining selection failed:', error.message);
        return null;
    }
}

// Run the mining selection
runMiningSelection().catch(console.error);
