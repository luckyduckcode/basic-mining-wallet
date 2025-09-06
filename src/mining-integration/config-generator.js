const fs = require('fs').promises;
const path = require('path');

class MiningConfigGenerator {
  constructor() {
    this.configsDir = path.join(__dirname, '../../mining-configs');
  }

  async ensureConfigDir() {
    try {
      await fs.mkdir(this.configsDir, { recursive: true });
    } catch (error) {
      console.log('Config directory already exists');
    }
  }

  // Generate GMiner configuration
  async generateGMinerConfig(walletData, algorithm, pool) {
    await this.ensureConfigDir();

    const config = {
      algorithm: algorithm,
      server: pool.url,
      port: pool.port || 4444,
      user: walletData.address,
      pass: 'x',
      devices: 'all',
      intensity: '100',
      worksize: '256',
      watchdog: '1',
      templimit: '80',
      templimit_mem: '90',
      fan: 'auto',
      log: '1',
      log_date: '1',
      log_stratum: '0',
      log_path: './logs/',
      api: '1',
      api_port: '3333'
    };

    const configPath = path.join(this.configsDir, `gminer-${algorithm}-${Date.now()}.conf`);
    const configContent = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(configPath, configContent);
    return configPath;
  }

  // Generate T-Rex configuration
  async generateTRexConfig(walletData, algorithm, pool) {
    await this.ensureConfigDir();

    const config = {
      algo: algorithm,
      pool: `${pool.url}:${pool.port || 4444}`,
      wallet: walletData.address,
      password: 'x',
      devices: 'all',
      intensity: '25',
      worker: '',
      api_bind: '127.0.0.1:4067',
      log_path: './logs/',
      no_color: false,
      watchdog: true,
      temp_limit: '80',
      temp_start: '50'
    };

    const configPath = path.join(this.configsDir, `trex-${algorithm}-${Date.now()}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    return configPath;
  }

  // Generate NBMiner configuration
  async generateNBMinerConfig(walletData, algorithm, pool) {
    await this.ensureConfigDir();

    const config = {
      algo: algorithm,
      devices: 'auto',
      wallet: walletData.address,
      pool: `${pool.url}:${pool.port || 4444}`,
      password: 'x',
      intensity: '100',
      log_file: './logs/nbminer.log',
      api: '127.0.0.1:22333',
      temperature_limit: '80',
      power_limit: '80'
    };

    const configPath = path.join(this.configsDir, `nbminer-${algorithm}-${Date.now()}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    return configPath;
  }

  // Generate LOLMiner configuration
  async generateLOLMinerConfig(walletData, algorithm, pool) {
    await this.ensureConfigDir();

    const config = {
      MINER: {
        ALGO: algorithm,
        POOL: `${pool.url}:${pool.port || 4444}`,
        USER: walletData.address,
        PASS: 'x',
        DEVICES: 'all',
        API_PORT: 44444,
        LOG: 1,
        LOGFILE: './logs/lolminer.log'
      },
      GPU_DEVICES: [{
        INDEX: 0,
        INTENSITY: 100,
        WORKSIZE: 256
      }]
    };

    const configPath = path.join(this.configsDir, `lolminer-${algorithm}-${Date.now()}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    return configPath;
  }

  // Generate unified mining configuration
  async generateUnifiedConfig(walletData, miningSoftware = 'gminer') {
    await this.ensureConfigDir();

    const unifiedConfig = {
      miningSoftware: miningSoftware,
      wallet: walletData,
      configurations: {},
      generatedAt: new Date().toISOString(),
      version: '1.0'
    };

    // Generate configurations for all supported algorithms
    const algorithms = ['ethash', 'kawpow', 'autolykos', 'octopus'];
    const pools = {
      ethash: { url: 'us1.ethermine.org', port: 4444 },
      kawpow: { url: 'rvn.f2pool.com', port: 6688 },
      autolykos: { url: 'erg.f2pool.com', port: 6688 },
      octopus: { url: 'cfx.f2pool.com', port: 6688 }
    };

    for (const algorithm of algorithms) {
      const pool = pools[algorithm];
      if (pool) {
        switch (miningSoftware) {
          case 'gminer':
            unifiedConfig.configurations[algorithm] = {
              configPath: await this.generateGMinerConfig(walletData, algorithm, pool),
              command: `gminer.exe -c ${path.basename(await this.generateGMinerConfig(walletData, algorithm, pool))}`
            };
            break;
          case 'trex':
            unifiedConfig.configurations[algorithm] = {
              configPath: await this.generateTRexConfig(walletData, algorithm, pool),
              command: `t-rex.exe -c ${path.basename(await this.generateTRexConfig(walletData, algorithm, pool))}`
            };
            break;
          case 'nbminer':
            unifiedConfig.configurations[algorithm] = {
              configPath: await this.generateNBMinerConfig(walletData, algorithm, pool),
              command: `nbminer.exe -c ${path.basename(await this.generateNBMinerConfig(walletData, algorithm, pool))}`
            };
            break;
          case 'lolminer':
            unifiedConfig.configurations[algorithm] = {
              configPath: await this.generateLOLMinerConfig(walletData, algorithm, pool),
              command: `lolminer.exe --config ${path.basename(await this.generateLOLMinerConfig(walletData, algorithm, pool))}`
            };
            break;
        }
      }
    }

    const unifiedPath = path.join(this.configsDir, `unified-${miningSoftware}-${Date.now()}.json`);
    await fs.writeFile(unifiedPath, JSON.stringify(unifiedConfig, null, 2));

    return unifiedConfig;
  }

  // Get all generated configurations
  async listConfigurations() {
    try {
      const files = await fs.readdir(this.configsDir);
      return files.filter(file => file.endsWith('.conf') || file.endsWith('.json'));
    } catch (error) {
      return [];
    }
  }

  // Validate configuration
  async validateConfig(configPath) {
    try {
      const content = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(content);

      // Basic validation
      const required = ['wallet', 'algorithm', 'pool'];
      const missing = required.filter(field => !config[field]);

      return {
        valid: missing.length === 0,
        missing: missing,
        config: config
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = { MiningConfigGenerator };
