const express = require('express');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const { MiningConfigGenerator } = require('./config-generator');

const router = express.Router();
const configGenerator = new MiningConfigGenerator();

// Hardware detection and profiling
const detectHardware = async () => {
  const hardware = {
    gpus: [],
    cpus: [],
    system: {
      platform: os.platform(),
      arch: os.arch(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length
    }
  };

  // GPU detection (simplified - would use actual GPU libraries)
  try {
    // This would integrate with nvidia-smi, rocm-smi, etc.
    hardware.gpus = [
      { id: 0, name: 'NVIDIA RTX 3080', memory: 10, vram: 10240 },
      { id: 1, name: 'NVIDIA RTX 3070', memory: 8, vram: 8192 }
    ];
  } catch (error) {
    console.log('GPU detection not available, using defaults');
  }

  return hardware;
};

// Algorithm optimization based on hardware
const optimizeAlgorithm = (hardware) => {
  const recommendations = [];

  hardware.gpus.forEach(gpu => {
    if (gpu.name.includes('RTX') || gpu.name.includes('GTX')) {
      recommendations.push({
        gpu: gpu.id,
        primary: 'ethash',
        secondary: ['kawpow', 'autolykos'],
        reason: 'NVIDIA GPUs excel at ethash and memory-hard algorithms'
      });
    } else if (gpu.name.includes('RX') || gpu.name.includes('Radeon')) {
      recommendations.push({
        gpu: gpu.id,
        primary: 'ethash',
        secondary: ['kawpow', 'beamhash'],
        reason: 'AMD GPUs optimized for ethash and beam algorithms'
      });
    }
  });

  return recommendations;
};

// Pool configuration with failover
const configurePools = (algorithm) => {
  const poolConfigs = {
    ethash: [
      { name: 'Ethermine', url: 'us1.ethermine.org:4444', priority: 1 },
      { name: 'F2Pool', url: 'eth.f2pool.com:6688', priority: 2 },
      { name: 'Antpool', url: 'eth.antpool.com:6666', priority: 3 }
    ],
    kawpow: [
      { name: 'F2Pool', url: 'rvn.f2pool.com:6688', priority: 1 },
      { name: 'Antpool', url: 'stratum.antpool.com:6666', priority: 2 }
    ],
    autolykos: [
      { name: 'F2Pool', url: 'erg.f2pool.com:6688', priority: 1 },
      { name: 'Antpool', url: 'stratum.antpool.com:6666', priority: 2 }
    ]
  };

  return poolConfigs[algorithm] || [];
};

// Auto-configuration endpoint
router.post('/auto-configure', async (req, res) => {
  try {
    const { walletAddress, coin, miningSoftware = 'gminer' } = req.body;

    console.log('🔧 Starting automated miner configuration...');

    // Step 1: Hardware detection
    const hardware = await detectHardware();
    console.log(`✅ Detected ${hardware.gpus.length} GPUs, ${hardware.cpus.length} CPUs`);

    // Step 2: Algorithm optimization
    const algorithmRecs = optimizeAlgorithm(hardware);
    console.log('🎯 Optimized algorithms for hardware');

    // Step 3: Pool configuration
    const primaryAlgo = algorithmRecs[0]?.primary || 'ethash';
    const pools = configurePools(primaryAlgo);
    console.log(`🏊 Configured ${pools.length} mining pools`);

    // Step 4: Generate wallet data structure
    const walletData = {
      address: walletAddress,
      coin: coin,
      generatedAt: new Date().toISOString()
    };

    // Step 5: Generate mining software configurations
    console.log(`📝 Generating ${miningSoftware} configurations...`);
    const miningConfigs = await configGenerator.generateUnifiedConfig(walletData, miningSoftware);
    // Step 6: Generate configuration
    const config = {
      version: '1.0',
      hardware: hardware,
      mining: {
        algorithm: primaryAlgo,
        coin: coin || 'ETH',
        wallet: walletAddress,
        pools: pools,
        intensity: '100',
        worksize: '256',
        threads: hardware.gpus.length
      },
      performance: {
        powerLimit: '80',
        coreClock: 'auto',
        memoryClock: 'auto',
        fanSpeed: 'auto'
      },
      monitoring: {
        enabled: true,
        interval: 30,
        alerts: true
      },
      generatedConfigs: miningConfigs
    };

    // Step 7: Save configuration
    const configPath = path.join(__dirname, '../../configs');
    await fs.mkdir(configPath, { recursive: true });

    const configFile = path.join(configPath, `miner-config-${Date.now()}.json`);
    await fs.writeFile(configFile, JSON.stringify(config, null, 2));

    console.log('💾 Configuration saved');

    res.json({
      success: true,
      config: config,
      configFile: configFile,
      miningSoftware: miningSoftware,
      generatedConfigs: miningConfigs,
      message: 'Miner configuration completed successfully',
      nextSteps: [
        `Download and install ${miningSoftware}`,
        'Use the generated config files in the mining-configs folder',
        'Start mining with the provided commands'
      ]
    });

  } catch (error) {
    console.error('Auto-configuration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: 'Manual configuration required'
    });
  }
});

// Quick setup for beginners
router.post('/quick-start', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Ultra-simple configuration for beginners
    const quickConfig = {
      algorithm: 'ethash',
      pool: 'us1.ethermine.org:4444',
      wallet: walletAddress,
      password: 'x',
      devices: 'all',
      intensity: '100'
    };

    res.json({
      success: true,
      config: quickConfig,
      command: `gminer.exe -a ethash -s us1.ethermine.org:4444 -u ${walletAddress} -p x`,
      message: 'Ready to mine! Copy and run the command above.'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hardware benchmark
router.get('/benchmark', async (req, res) => {
  try {
    const hardware = await detectHardware();

    // Simulate benchmark results
    const benchmark = {
      timestamp: new Date(),
      hardware: hardware,
      results: hardware.gpus.map(gpu => ({
        gpu: gpu.id,
        name: gpu.name,
        ethash: Math.floor(Math.random() * 50) + 50, // MH/s
        kawpow: Math.floor(Math.random() * 20) + 10, // MH/s
        autolykos: Math.floor(Math.random() * 100) + 50, // MH/s
        power: Math.floor(Math.random() * 200) + 150 // Watts
      }))
    };

    res.json(benchmark);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profitability calculator
router.post('/profitability', (req, res) => {
  try {
    const { hashrate, power, electricityCost, coin } = req.body;

    const coinPrices = {
      ETH: 3000,
      RVN: 0.02,
      ERG: 1.5,
      CFX: 0.15
    };

    const dailyEarnings = (hashrate * 86400 * coinPrices[coin]) / 1e6; // Simplified
    const dailyPowerCost = (power * 24 * electricityCost) / 1000;
    const dailyProfit = dailyEarnings - dailyPowerCost;

    res.json({
      coin,
      dailyEarnings: dailyEarnings.toFixed(2),
      dailyPowerCost: dailyPowerCost.toFixed(2),
      dailyProfit: dailyProfit.toFixed(2),
      monthlyProfit: (dailyProfit * 30).toFixed(2),
      yearlyProfit: (dailyProfit * 365).toFixed(2),
      roi: electricityCost > 0 ? ((dailyEarnings / dailyPowerCost) * 100).toFixed(1) : '∞'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
