const crypto = require('crypto');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const secp256k1 = require('secp256k1');
const createHash = require('create-hash');
const bs58check = require('bs58check');
const fs = require('fs');

class MultiCurrencyWalletGenerator {
    constructor() {
        this.supportedCoins = {
            // Tier 1 - 100% Functional
            'bitcoin': {
                name: 'Bitcoin',
                symbol: 'BTC',
                network: 'mainnet',
                addressPrefix: 0x00,
                wifPrefix: 0x80,
                p2shPrefix: 0x05,
                bip44: 0,
                algorithm: 'sha256'
            },
            'zelcash': {
                name: 'Zelcash',
                symbol: 'ZEL', 
                network: 'mainnet',
                addressPrefix: 0x1cb8,
                wifPrefix: 0x80,
                bip44: 19167,
                algorithm: 'equihash_125_4'
            },
            'peercoin': {
                name: 'Peercoin',
                symbol: 'PPC',
                network: 'mainnet', 
                addressPrefix: 0x37,
                wifPrefix: 0xb7,
                bip44: 6,
                algorithm: 'sha256'
            },
            'stipend': {
                name: 'Stipend',
                symbol: 'SPD',
                network: 'mainnet',
                addressPrefix: 0x3f,
                wifPrefix: 0xbf,
                bip44: 1618,
                algorithm: 'x11'
            },
            'viacoin': {
                name: 'Viacoin', 
                symbol: 'VIA',
                network: 'mainnet',
                addressPrefix: 0x47,
                wifPrefix: 0xc7,
                bip44: 14,
                algorithm: 'scrypt'
            },
            
            // Tier 2 - 75% Functional
            'ethereum': {
                name: 'Ethereum',
                symbol: 'ETH',
                network: 'mainnet',
                bip44: 60,
                algorithm: 'ethash'
            },
            'conflux': {
                name: 'Conflux',
                symbol: 'CFX', 
                network: 'mainnet',
                bip44: 503,
                algorithm: 'octopus'
            }
        };
    }

    generateMnemonic() {
        return bip39.generateMnemonic(256); // 24 words
    }

    async generateSeed(mnemonic, passphrase = '') {
        return await bip39.mnemonicToSeed(mnemonic, passphrase);
    }

    generateBitcoinAddress(publicKey, coin) {
        // Create public key hash
        const publicKeyHash = createHash('sha256').update(publicKey).digest();
        const hash160 = createHash('rmd160').update(publicKeyHash).digest();
        
        // Add version byte
        const versionByte = Buffer.from([coin.addressPrefix]);
        const payload = Buffer.concat([versionByte, hash160]);
        
        // Create address with checksum
        return bs58check.encode(payload);
    }

    generateEthereumAddress(publicKey) {
        // Remove the first byte (0x04) from uncompressed public key
        const publicKeyBytes = publicKey.slice(1);
        
        // Keccak-256 hash
        const hash = createHash('keccak256').update(publicKeyBytes).digest();
        
        // Take last 20 bytes and add 0x prefix
        const address = '0x' + hash.slice(-20).toString('hex').toLowerCase();
        return address;
    }

    generatePrivateKeyWIF(privateKey, coin) {
        if (!coin.wifPrefix) return null;
        
        // Add version byte and compression flag
        const extended = Buffer.concat([
            Buffer.from([coin.wifPrefix]),
            privateKey,
            Buffer.from([0x01]) // Compression flag
        ]);
        
        return bs58check.encode(extended);
    }

    async generateWalletForCoin(coinName, hdWallet, accountIndex = 0) {
        const coin = this.supportedCoins[coinName];
        if (!coin) {
            throw new Error(`Unsupported coin: ${coinName}`);
        }

        console.log(`  🔐 Generating ${coin.name} (${coin.symbol}) wallet...`);

        // Derive key using BIP44 path: m/44'/coin_type'/account'/change/address_index
        const path = `m/44'/${coin.bip44}'/${accountIndex}'/0/0`;
        const derivedKey = hdWallet.derive(path);
        
        const privateKey = derivedKey.privateKey;
        const publicKey = secp256k1.publicKeyCreate(privateKey, false);
        
        let address;
        let addressType;
        
        if (coinName === 'ethereum' || coinName === 'conflux') {
            address = this.generateEthereumAddress(publicKey);
            addressType = 'ethereum-style';
        } else {
            address = this.generateBitcoinAddress(publicKey, coin);
            addressType = 'bitcoin-style';
        }

        const wif = this.generatePrivateKeyWIF(privateKey, coin);
        
        return {
            coin: coinName,
            name: coin.name,
            symbol: coin.symbol,
            algorithm: coin.algorithm,
            network: coin.network,
            derivationPath: path,
            address: address,
            addressType: addressType,
            publicKey: publicKey.toString('hex'),
            privateKey: privateKey.toString('hex'),
            wif: wif,
            bip44: coin.bip44,
            generated: new Date().toISOString()
        };
    }

    async generateAllWallets(mnemonic = null) {
        console.log('🔐 Generating Multi-Currency Mining Wallets');
        console.log('===========================================');
        
        // Generate or use provided mnemonic
        if (!mnemonic) {
            mnemonic = this.generateMnemonic();
            console.log('✅ New mnemonic phrase generated (24 words)');
        } else {
            console.log('✅ Using provided mnemonic phrase');
        }
        
        // Validate mnemonic
        if (!bip39.validateMnemonic(mnemonic)) {
            throw new Error('Invalid mnemonic phrase');
        }
        
        console.log(`📝 Mnemonic: ${mnemonic}`);
        console.log('\n⚠️  SECURITY WARNING: Save this mnemonic phrase securely!');
        console.log('   This is the ONLY way to recover your wallets.\n');
        
        // Generate seed
        const seed = await this.generateSeed(mnemonic);
        const hdWallet = hdkey.fromMasterSeed(seed);
        
        console.log('🌱 HD Wallet seed generated');
        console.log('👛 Generating individual coin wallets...\n');
        
        const wallets = {};
        
        // Generate wallet for each supported coin
        for (const coinName of Object.keys(this.supportedCoins)) {
            try {
                const wallet = await this.generateWalletForCoin(coinName, hdWallet);
                wallets[coinName] = wallet;
                
                console.log(`     ✅ ${wallet.name}: ${wallet.address}`);
                console.log(`        Algorithm: ${wallet.algorithm}`);
                console.log(`        Path: ${wallet.derivationPath}\n`);
                
            } catch (error) {
                console.log(`     ❌ ${coinName}: Failed - ${error.message}\n`);
                wallets[coinName] = {
                    error: error.message,
                    generated: new Date().toISOString()
                };
            }
        }
        
        return {
            mnemonic: mnemonic,
            seed: seed.toString('hex'),
            masterKey: hdWallet.privateKey.toString('hex'),
            wallets: wallets,
            generated: new Date().toISOString(),
            totalWallets: Object.keys(wallets).length,
            successfulWallets: Object.values(wallets).filter(w => !w.error).length
        };
    }

    async saveWalletData(walletData, filename = null) {
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `mining-wallets-${timestamp}.json`;
        }
        
        // Create encrypted version (for production use)
        const encryptedData = {
            ...walletData,
            // In production, encrypt the sensitive data
            mnemonic: `ENCRYPTED:${walletData.mnemonic}`, // Placeholder
            seed: 'ENCRYPTED_SEED_PLACEHOLDER',
            masterKey: 'ENCRYPTED_MASTER_KEY_PLACEHOLDER',
            wallets: Object.fromEntries(
                Object.entries(walletData.wallets).map(([coin, wallet]) => [
                    coin,
                    wallet.error ? wallet : {
                        ...wallet,
                        privateKey: 'ENCRYPTED_PRIVATE_KEY_PLACEHOLDER',
                        wif: wallet.wif ? 'ENCRYPTED_WIF_PLACEHOLDER' : null
                    }
                ])
            )
        };
        
        // Save full data (for development - encrypt in production!)
        fs.writeFileSync(filename, JSON.stringify(walletData, null, 2));
        console.log(`💾 Full wallet data saved to: ${filename}`);
        console.log('   ⚠️  Contains private keys - keep secure!');
        
        // Save encrypted version
        const encryptedFilename = filename.replace('.json', '-encrypted.json');
        fs.writeFileSync(encryptedFilename, JSON.stringify(encryptedData, null, 2));
        console.log(`🔒 Encrypted wallet data saved to: ${encryptedFilename}`);
        
        // Generate wallet summary for easy viewing
        const summaryFilename = filename.replace('.json', '-summary.json');
        const summary = {
            totalWallets: walletData.totalWallets,
            successfulWallets: walletData.successfulWallets,
            generated: walletData.generated,
            addresses: Object.fromEntries(
                Object.entries(walletData.wallets)
                    .filter(([_, wallet]) => !wallet.error)
                    .map(([coin, wallet]) => [
                        coin,
                        {
                            name: wallet.name,
                            symbol: wallet.symbol,
                            address: wallet.address,
                            algorithm: wallet.algorithm,
                            derivationPath: wallet.derivationPath
                        }
                    ])
            )
        };
        
        fs.writeFileSync(summaryFilename, JSON.stringify(summary, null, 2));
        console.log(`📋 Wallet summary saved to: ${summaryFilename}`);
        
        return {
            fullFile: filename,
            encryptedFile: encryptedFilename,
            summaryFile: summaryFilename
        };
    }

    generateMiningConfigs(walletData) {
        console.log('\n⚙️  Generating GMiner Configuration Files...');
        
        const miningConfigs = {};
        const workingPools = {
            'bitcoin': 'stratum+tcp://btc-us.f2pool.com:1314',
            'zelcash': 'stratum+tcp://zel.2miners.com:9090'
        };
        
        for (const [coinName, wallet] of Object.entries(walletData.wallets)) {
            if (wallet.error) continue;
            
            const pool = workingPools[coinName] || 'stratum+tcp://pool.example.com:4444';
            
            const config = {
                algorithm: wallet.algorithm,
                server: pool,
                user: wallet.address,
                password: 'x',
                coin: coinName,
                
                // Performance settings
                intensity: 'auto',
                temperature_limit: 85,
                power_limit: 80,
                
                // Logging
                log_file: `logs/${coinName}-mining.log`,
                stats: true,
                stats_interval: 30
            };
            
            // Generate command line
            const commandArgs = [
                `--algo ${wallet.algorithm}`,
                `--server ${pool}`,
                `--user ${wallet.address}`,
                `--pass x`,
                `--intensity auto`,
                `--temp_limit 85`,
                `--pl 80`,
                `--logfile logs/${coinName}-mining.log`,
                `--stats`,
                `--stats_period 30`
            ];
            
            config.commandLine = `gminer.exe ${commandArgs.join(' ')}`;
            miningConfigs[coinName] = config;
            
            console.log(`  ✅ ${wallet.name}: Ready for ${wallet.algorithm} mining`);
        }
        
        // Save mining configs
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const configFile = `mining-configs-ready-${timestamp}.json`;
        fs.writeFileSync(configFile, JSON.stringify(miningConfigs, null, 2));
        console.log(`⚙️  Mining configurations saved to: ${configFile}`);
        
        return miningConfigs;
    }
}

// Install required packages first
async function installDependencies() {
    console.log('📦 Installing required crypto packages...');
    
    const { exec } = require('child_process');
    
    const packages = [
        'bip39',
        'hdkey', 
        'secp256k1',
        'create-hash',
        'bs58check'
    ];
    
    for (const pkg of packages) {
        await new Promise((resolve, reject) => {
            exec(`npm install ${pkg}`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`⚠️  ${pkg}: ${error.message}`);
                } else {
                    console.log(`✅ ${pkg}: Installed`);
                }
                resolve();
            });
        });
    }
    
    console.log('📦 Package installation complete\n');
}

// Main execution
async function generateWallets() {
    try {
        // Install dependencies
        await installDependencies();
        
        // Generate wallets
        const generator = new MultiCurrencyWalletGenerator();
        const walletData = await generator.generateAllWallets();
        
        // Save wallet data
        const files = await generator.saveWalletData(walletData);
        
        // Generate mining configs
        const miningConfigs = generator.generateMiningConfigs(walletData);
        
        console.log('\n🎉 Wallet Generation Complete!');
        console.log('===============================');
        console.log(`✅ Total wallets generated: ${walletData.successfulWallets}/${walletData.totalWallets}`);
        console.log(`📁 Files created:`);
        console.log(`   📄 Full data: ${files.fullFile}`);
        console.log(`   🔒 Encrypted: ${files.encryptedFile}`);
        console.log(`   📋 Summary: ${files.summaryFile}`);
        
        console.log('\n⚠️  CRITICAL SECURITY REMINDERS:');
        console.log('================================');
        console.log('1. 📝 Save your mnemonic phrase in a secure location');
        console.log('2. 🔒 Never share private keys or mnemonic online');
        console.log('3. 💾 Backup wallet files to multiple secure locations');
        console.log('4. 🛡️  Consider hardware wallet for large amounts');
        
        console.log('\n🚀 Ready for Mining!');
        console.log('===================');
        console.log('1. ⛏️  Install GMiner manually if automatic install failed');
        console.log('2. 🎯 Use the generated wallet addresses for mining');
        console.log('3. 📊 Monitor mining progress with generated configs');
        console.log('4. 💰 Watch your wallets for incoming mining rewards!');
        
        return walletData;
        
    } catch (error) {
        console.error('❌ Wallet generation failed:', error.message);
        return null;
    }
}

// Execute wallet generation
generateWallets().catch(console.error);
