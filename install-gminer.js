const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class GMinerInstaller {
    constructor() {
        this.installDir = 'C:\\GMiner';
        this.githubAPI = 'https://api.github.com/repos/develsoftware/GMinerRelease/releases/latest';
        this.userAgent = 'Mining-Wallet-Installer/1.0';
    }

    async getLatestRelease() {
        console.log('🔍 Checking for latest GMiner release...');
        
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'User-Agent': this.userAgent
                }
            };

            https.get(this.githubAPI, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const release = JSON.parse(data);
                        console.log(`✅ Latest GMiner version: ${release.tag_name}`);
                        console.log(`📅 Released: ${new Date(release.published_at).toLocaleDateString()}`);
                        
                        // Find Windows download
                        const windowsAsset = release.assets.find(asset => 
                            asset.name.includes('win') || 
                            asset.name.includes('windows') ||
                            asset.name.endsWith('.zip')
                        );
                        
                        if (!windowsAsset) {
                            reject(new Error('No Windows version found'));
                            return;
                        }
                        
                        resolve({
                            version: release.tag_name,
                            downloadUrl: windowsAsset.browser_download_url,
                            fileName: windowsAsset.name,
                            fileSize: windowsAsset.size,
                            publishedAt: release.published_at
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject);
        });
    }

    async downloadGMiner(releaseInfo) {
        console.log(`📥 Downloading GMiner ${releaseInfo.version}...`);
        console.log(`📁 File: ${releaseInfo.fileName}`);
        console.log(`📊 Size: ${(releaseInfo.fileSize / 1024 / 1024).toFixed(2)} MB`);
        
        // Create install directory
        if (!fs.existsSync(this.installDir)) {
            fs.mkdirSync(this.installDir, { recursive: true });
            console.log(`📁 Created directory: ${this.installDir}`);
        }
        
        const downloadPath = path.join(this.installDir, releaseInfo.fileName);
        
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(downloadPath);
            
            https.get(releaseInfo.downloadUrl, (response) => {
                const totalSize = parseInt(response.headers['content-length'], 10);
                let downloadedSize = 0;
                
                response.pipe(file);
                
                response.on('data', (chunk) => {
                    downloadedSize += chunk.length;
                    const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
                    process.stdout.write(`\r📥 Progress: ${progress}% (${(downloadedSize / 1024 / 1024).toFixed(2)} MB)`);
                });
                
                file.on('finish', () => {
                    file.close();
                    console.log(`\n✅ Download completed: ${downloadPath}`);
                    resolve(downloadPath);
                });
                
                file.on('error', (error) => {
                    fs.unlink(downloadPath, () => {}); // Delete incomplete file
                    reject(error);
                });
            }).on('error', reject);
        });
    }

    async extractGMiner(zipPath) {
        console.log('📦 Extracting GMiner...');
        
        return new Promise((resolve, reject) => {
            // Use PowerShell to extract zip file
            const extractCommand = `Expand-Archive -Path "${zipPath}" -DestinationPath "${this.installDir}" -Force`;
            
            exec(`powershell.exe -Command "${extractCommand}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Extraction failed:', error.message);
                    reject(error);
                    return;
                }
                
                console.log('✅ Extraction completed');
                
                // Find GMiner executable
                const files = fs.readdirSync(this.installDir, { withFileTypes: true });
                let gMinerPath = null;
                
                // Look for gminer.exe in subdirectories
                for (const file of files) {
                    if (file.isDirectory()) {
                        const subDirPath = path.join(this.installDir, file.name);
                        const subFiles = fs.readdirSync(subDirPath);
                        
                        if (subFiles.includes('gminer.exe')) {
                            gMinerPath = path.join(subDirPath, 'gminer.exe');
                            break;
                        }
                    } else if (file.name === 'gminer.exe') {
                        gMinerPath = path.join(this.installDir, 'gminer.exe');
                        break;
                    }
                }
                
                if (gMinerPath && fs.existsSync(gMinerPath)) {
                    console.log(`✅ GMiner executable found: ${gMinerPath}`);
                    resolve(gMinerPath);
                } else {
                    reject(new Error('GMiner executable not found after extraction'));
                }
            });
        });
    }

    async verifyInstallation(gMinerPath) {
        console.log('🔍 Verifying GMiner installation...');
        
        return new Promise((resolve, reject) => {
            exec(`"${gMinerPath}" --version`, { timeout: 10000 }, (error, stdout, stderr) => {
                if (error) {
                    console.log('⚠️  Version check failed, but GMiner executable exists');
                    resolve({
                        installed: true,
                        path: gMinerPath,
                        version: 'Unknown',
                        verified: false
                    });
                    return;
                }
                
                console.log('✅ GMiner installation verified');
                console.log(`📋 Version info: ${stdout.trim()}`);
                
                resolve({
                    installed: true,
                    path: gMinerPath,
                    version: stdout.trim(),
                    verified: true
                });
            });
        });
    }

    async install() {
        try {
            console.log('🚀 Starting GMiner Installation Process');
            console.log('==========================================');
            
            // Step 1: Get latest release info
            const releaseInfo = await this.getLatestRelease();
            
            // Step 2: Download GMiner
            const downloadPath = await this.downloadGMiner(releaseInfo);
            
            // Step 3: Extract archive
            const gMinerPath = await this.extractGMiner(downloadPath);
            
            // Step 4: Verify installation
            const verification = await this.verifyInstallation(gMinerPath);
            
            // Step 5: Clean up zip file
            fs.unlinkSync(downloadPath);
            console.log('🧹 Cleaned up download file');
            
            console.log('\n✅ GMiner Installation Complete!');
            console.log('=====================================');
            console.log(`📍 Installation Path: ${verification.path}`);
            console.log(`📋 Version: ${verification.version}`);
            console.log(`✅ Verified: ${verification.verified ? 'Yes' : 'No'}`);
            
            // Generate quick start guide
            const quickStartPath = path.join(this.installDir, 'MINING_QUICK_START.txt');
            const quickStart = `GMiner Quick Start Guide
========================

Installation Details:
- GMiner Path: ${verification.path}
- Version: ${verification.version}
- Installed: ${new Date().toLocaleString()}

Basic Usage:
1. Open Command Prompt as Administrator
2. Navigate to: ${path.dirname(verification.path)}
3. Run: gminer.exe --help

Example Mining Commands:
- Bitcoin: gminer.exe --algo sha256 --server stratum+tcp://pool.com:3333 --user YOUR_WALLET --pass x
- Ethereum: gminer.exe --algo ethash --server stratum+tcp://pool.com:4444 --user YOUR_WALLET --pass x
- Zelcash: gminer.exe --algo 125_4 --server stratum+tcp://zel.2miners.com:9090 --user YOUR_WALLET --pass x

For more information visit: https://github.com/develsoftware/GMinerRelease
`;
            
            fs.writeFileSync(quickStartPath, quickStart);
            console.log(`📄 Quick start guide created: ${quickStartPath}`);
            
            return verification;
            
        } catch (error) {
            console.error('❌ Installation failed:', error.message);
            console.log('\n🔧 Manual Installation Instructions:');
            console.log('1. Visit: https://github.com/develsoftware/GMinerRelease/releases');
            console.log('2. Download latest Windows release');
            console.log('3. Extract to C:\\GMiner\\');
            console.log('4. Verify gminer.exe is accessible');
            throw error;
        }
    }
}

// Run installation
async function installGMiner() {
    const installer = new GMinerInstaller();
    
    try {
        const result = await installer.install();
        
        console.log('\n🎯 Next Steps:');
        console.log('1. ✅ GMiner is now installed and ready');
        console.log('2. 🔐 Generate cryptocurrency wallet addresses');
        console.log('3. ⚙️ Configure mining pools for each coin');
        console.log('4. 🚀 Start mining with your preferred cryptocurrency');
        
        return result;
    } catch (error) {
        console.error('Installation process failed:', error.message);
        return null;
    }
}

// Execute installation
installGMiner().catch(console.error);
