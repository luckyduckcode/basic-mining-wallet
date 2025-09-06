#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function detectHardware() {
    console.log('🔍 Detecting hardware...');

    try {
        const response = await axios.get(`${API_BASE}/api/mining/config/benchmark`);
        const hardware = response.data;

        console.log(`✅ Found ${hardware.results.length} GPU(s)`);
        hardware.results.forEach(gpu => {
            console.log(`   - ${gpu.name}: ${gpu.ethash} MH/s Ethash`);
        });

        return hardware;
    } catch (error) {
        console.log('⚠️  Hardware detection failed, using defaults');
        return null;
    }
}

async function getWalletAddress() {
    console.log('\n💰 Wallet Configuration');
    console.log('Supported coins: ETH, RVN, ERG, CFX');

    const coin = await question('Enter coin (ETH): ') || 'ETH';
    const wallet = await question('Enter your wallet address: ');

    if (!wallet) {
        console.log('❌ Wallet address is required');
        process.exit(1);
    }

    return { coin, wallet };
}

async function configureMiner(walletAddress, coin) {
    console.log('\n🔧 Configuring miner...');

    try {
        const response = await axios.post(`${API_BASE}/api/mining/config/auto-configure`, {
            walletAddress,
            coin
        });

        const config = response.data;

        console.log('✅ Configuration generated successfully!');
        console.log('\n📋 Next Steps:');
        config.nextSteps.forEach((step, i) => {
            console.log(`   ${i + 1}. ${step}`);
        });

        // Save configuration
        const configPath = path.join(process.cwd(), 'miner-config.json');
        fs.writeFileSync(configPath, JSON.stringify(config.config, null, 2));

        console.log(`\n💾 Configuration saved to: ${configPath}`);

        return config;
    } catch (error) {
        console.error('❌ Configuration failed:', error.response?.data?.error || error.message);
        process.exit(1);
    }
}

async function showProfitability(config) {
    console.log('\n💰 Profitability Estimate');

    try {
        const totalHashrate = config.config.hardware.gpus.reduce((sum, gpu) => sum + gpu.memory, 0);
        const avgPower = 200; // watts per GPU
        const electricityCost = 0.12; // $ per kWh

        const response = await axios.post(`${API_BASE}/api/mining/config/profitability`, {
            hashrate: totalHashrate,
            power: avgPower * config.config.hardware.gpus.length,
            electricityCost,
            coin: config.config.mining.coin
        });

        const profit = response.data;
        console.log(`Daily Earnings: $${profit.dailyEarnings}`);
        console.log(`Daily Power Cost: $${profit.dailyPowerCost}`);
        console.log(`Daily Profit: $${profit.dailyProfit}`);
        console.log(`Monthly Profit: $${profit.monthlyProfit}`);

    } catch (error) {
        console.log('⚠️  Could not calculate profitability');
    }
}

async function main() {
    console.log('🚀 Basic Mining Wallet - Auto Configuration CLI');
    console.log('==============================================\n');

    try {
        // Check if server is running
        await axios.get(`${API_BASE}/health`);
    } catch (error) {
        console.log('❌ Server not running. Please start the wallet server first:');
        console.log('   npm run dev');
        process.exit(1);
    }

    // Step 1: Hardware detection
    const hardware = await detectHardware();

    // Step 2: Get wallet info
    const { coin, wallet } = await getWalletAddress();

    // Step 3: Configure miner
    const config = await configureMiner(wallet, coin);

    // Step 4: Show profitability
    await showProfitability(config);

    console.log('\n🎉 Setup complete! Happy mining! ⛏️');
    console.log('\n💡 Pro tip: Run this command anytime to reconfigure:');
    console.log('   npx basic-mining-wallet configure');

    rl.close();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
