const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');

class MiningWalletUI {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.port = 3000;
        this.walletData = null;
        this.miningConfigs = null;
        this.miningProcesses = {};
        this.systemHealth = {};
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.loadWalletData();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use('/assets', express.static('assets'));
    }

    setupRoutes() {
        // Main dashboard
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        // API endpoints
        this.app.get('/api/wallets', (req, res) => {
            if (this.walletData) {
                const summary = {
                    totalWallets: this.walletData.totalWallets,
                    successfulWallets: this.walletData.successfulWallets,
                    generated: this.walletData.generated,
                    addresses: Object.fromEntries(
                        Object.entries(this.walletData.wallets)
                            .filter(([_, wallet]) => !wallet.error)
                            .map(([coin, wallet]) => [coin, {
                                name: wallet.name,
                                symbol: wallet.symbol,
                                address: wallet.address,
                                algorithm: wallet.algorithm
                            }])
                    )
                };
                res.json(summary);
            } else {
                res.json({ error: 'No wallet data found' });
            }
        });

        this.app.get('/api/mining/status', (req, res) => {
            const status = Object.fromEntries(
                Object.entries(this.miningProcesses).map(([coin, process]) => [
                    coin,
                    {
                        running: process && !process.killed,
                        pid: process ? process.pid : null,
                        startTime: process ? process.startTime : null
                    }
                ])
            );
            res.json(status);
        });

        this.app.post('/api/mining/start/:coin', (req, res) => {
            const coin = req.params.coin;
            this.startMining(coin, (success, message) => {
                res.json({ success, message, coin });
            });
        });

        this.app.post('/api/mining/stop/:coin', (req, res) => {
            const coin = req.params.coin;
            this.stopMining(coin, (success, message) => {
                res.json({ success, message, coin });
            });
        });

        this.app.get('/api/health', async (req, res) => {
            const health = await this.checkSystemHealth();
            res.json(health);
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Send initial data
            socket.emit('walletData', this.walletData);
            socket.emit('miningStatus', this.getMiningStatus());
            socket.emit('systemHealth', this.systemHealth);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        // Periodic updates
        setInterval(() => {
            this.io.emit('miningStatus', this.getMiningStatus());
        }, 5000);

        setInterval(async () => {
            const health = await this.checkSystemHealth();
            this.io.emit('systemHealth', health);
        }, 30000);
    }

    loadWalletData() {
        try {
            // Find the most recent wallet files
            const files = fs.readdirSync('.')
                .filter(f => f.startsWith('mining-wallets-') && f.endsWith('.json') && !f.includes('encrypted'))
                .sort().reverse();

            if (files.length > 0) {
                const walletFile = files[0];
                this.walletData = JSON.parse(fs.readFileSync(walletFile, 'utf8'));
                console.log(`✅ Loaded wallet data from: ${walletFile}`);
            }

            // Load mining configs
            const configFiles = fs.readdirSync('.')
                .filter(f => f.startsWith('mining-configs-ready-') && f.endsWith('.json'))
                .sort().reverse();

            if (configFiles.length > 0) {
                const configFile = configFiles[0];
                this.miningConfigs = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                console.log(`✅ Loaded mining configs from: ${configFile}`);
            }

        } catch (error) {
            console.error('❌ Error loading wallet data:', error.message);
        }
    }

    startMining(coin, callback) {
        if (this.miningProcesses[coin] && !this.miningProcesses[coin].killed) {
            callback(false, 'Mining already running for ' + coin);
            return;
        }

        const config = this.miningConfigs[coin];
        if (!config) {
            callback(false, 'No mining configuration found for ' + coin);
            return;
        }

        // Check if GMiner exists
        const gMinerPaths = [
            'C:\\GMiner\\gminer.exe',
            'C:\\Program Files\\GMiner\\gminer.exe',
            '.\\gminer.exe'
        ];

        let gMinerPath = null;
        for (const path of gMinerPaths) {
            if (fs.existsSync(path)) {
                gMinerPath = path;
                break;
            }
        }

        if (!gMinerPath) {
            callback(false, 'GMiner not found. Please install GMiner first.');
            return;
        }

        // Build command
        const args = [
            '--algo', config.algorithm,
            '--server', config.server,
            '--user', config.user,
            '--pass', config.password,
            '--intensity', 'auto',
            '--temp_limit', '85',
            '--pl', '80'
        ];

        console.log(`🚀 Starting mining for ${coin}...`);
        console.log(`Command: ${gMinerPath} ${args.join(' ')}`);

        try {
            const process = exec(`"${gMinerPath}" ${args.join(' ')}`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`❌ Mining stopped for ${coin}: ${error.message}`);
                    this.io.emit('miningEvent', {
                        type: 'stopped',
                        coin: coin,
                        message: error.message
                    });
                }
            });

            process.startTime = new Date();
            this.miningProcesses[coin] = process;

            // Handle process output
            process.stdout.on('data', (data) => {
                console.log(`${coin}: ${data}`);
                this.io.emit('miningOutput', {
                    coin: coin,
                    output: data.toString()
                });
            });

            process.stderr.on('data', (data) => {
                console.log(`${coin} ERROR: ${data}`);
                this.io.emit('miningOutput', {
                    coin: coin,
                    output: data.toString(),
                    type: 'error'
                });
            });

            process.on('close', (code) => {
                console.log(`${coin} mining process exited with code ${code}`);
                delete this.miningProcesses[coin];
                this.io.emit('miningEvent', {
                    type: 'stopped',
                    coin: coin,
                    exitCode: code
                });
            });

            callback(true, `Mining started for ${coin}`);
            this.io.emit('miningEvent', {
                type: 'started',
                coin: coin,
                pid: process.pid
            });

        } catch (error) {
            callback(false, `Failed to start mining: ${error.message}`);
        }
    }

    stopMining(coin, callback) {
        const process = this.miningProcesses[coin];
        if (!process || process.killed) {
            callback(false, 'No mining process running for ' + coin);
            return;
        }

        try {
            process.kill('SIGTERM');
            setTimeout(() => {
                if (!process.killed) {
                    process.kill('SIGKILL');
                }
            }, 5000);

            delete this.miningProcesses[coin];
            callback(true, `Mining stopped for ${coin}`);
            
            this.io.emit('miningEvent', {
                type: 'stopped',
                coin: coin,
                manual: true
            });

        } catch (error) {
            callback(false, `Failed to stop mining: ${error.message}`);
        }
    }

    getMiningStatus() {
        return Object.fromEntries(
            Object.entries(this.miningProcesses).map(([coin, process]) => [
                coin,
                {
                    running: process && !process.killed,
                    pid: process ? process.pid : null,
                    startTime: process ? process.startTime : null,
                    uptime: process ? Date.now() - process.startTime.getTime() : null
                }
            ])
        );
    }

    async checkSystemHealth() {
        const health = {
            timestamp: new Date().toISOString(),
            rpc: {},
            summary: { healthy: 0, total: 0 }
        };

        const endpoints = {
            'bitcoin': 'https://bitcoin-rpc.publicnode.com',
            'ethereum': 'https://ethereum-rpc.publicnode.com',
            'zelcash': 'https://explorer.zel.cash/api',
            'peercoin': 'https://explorer.peercoin.net/api'
        };

        for (const [coin, endpoint] of Object.entries(endpoints)) {
            try {
                const startTime = Date.now();
                let rpcData;

                if (endpoint.includes('/api')) {
                    await axios.get(`${endpoint}/status`, { timeout: 5000 });
                } else {
                    rpcData = {
                        jsonrpc: '2.0',
                        method: coin === 'ethereum' ? 'eth_blockNumber' : 'getblockchaininfo',
                        params: [],
                        id: 1
                    };
                    await axios.post(endpoint, rpcData, { timeout: 5000 });
                }

                health.rpc[coin] = {
                    status: 'healthy',
                    responseTime: Date.now() - startTime
                };
                health.summary.healthy++;

            } catch (error) {
                health.rpc[coin] = {
                    status: 'unhealthy',
                    error: error.message
                };
            }
            health.summary.total++;
        }

        health.summary.healthPercentage = (health.summary.healthy / health.summary.total * 100).toFixed(1);
        this.systemHealth = health;
        
        return health;
    }

    start() {
        // Create public directory if it doesn't exist
        if (!fs.existsSync('public')) {
            fs.mkdirSync('public');
        }

        this.createHTMLInterface();

        this.server.listen(this.port, () => {
            console.log('🌐 Mining Wallet UI Server Started');
            console.log('===================================');
            console.log(`📡 Server running on http://localhost:${this.port}`);
            console.log(`📊 Dashboard: http://localhost:${this.port}`);
            console.log(`🔌 WebSocket: ws://localhost:${this.port}`);
            console.log('\n🎯 Features:');
            console.log('- 👛 Wallet management and monitoring');
            console.log('- ⛏️  Mining control (start/stop)');
            console.log('- 📈 Real-time system health monitoring');
            console.log('- 🔄 Live mining output streaming');
        });
    }

    createHTMLInterface() {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic Mining Wallet - Dashboard</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .status-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .card { 
            background: rgba(255,255,255,0.15);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .card h3 { margin-bottom: 15px; color: #FFD700; }
        .wallet-item, .mining-item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
        }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-healthy { background: #4CAF50; }
        .status-unhealthy { background: #F44336; }
        .status-running { background: #2196F3; }
        .status-stopped { background: #757575; }
        button {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin: 2px;
        }
        button:hover { opacity: 0.8; }
        button.stop { background: linear-gradient(45deg, #f44336, #d32f2f); }
        .mining-output {
            background: #000;
            color: #00ff00;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
            margin-top: 15px;
        }
        .health-summary {
            text-align: center;
            font-size: 1.5em;
            margin-bottom: 15px;
        }
        .timestamp { 
            font-size: 0.9em; 
            color: #BBB; 
            text-align: center; 
            margin-top: 10px; 
        }
        .address { 
            font-family: 'Courier New', monospace; 
            font-size: 0.9em; 
            word-break: break-all; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⛏️ Basic Mining Wallet</h1>
            <p>Real-time mining dashboard and wallet management</p>
        </div>

        <div class="status-grid">
            <div class="card">
                <h3>👛 Cryptocurrency Wallets</h3>
                <div id="wallets">Loading wallets...</div>
            </div>

            <div class="card">
                <h3>⛏️ Mining Operations</h3>
                <div id="mining-status">Loading mining status...</div>
            </div>

            <div class="card">
                <h3>🏥 System Health</h3>
                <div id="system-health">Checking system health...</div>
            </div>
        </div>

        <div class="card">
            <h3>📄 Mining Output</h3>
            <div id="mining-output" class="mining-output">
                Waiting for mining operations...
            </div>
        </div>
    </div>

    <script>
        const socket = io();
        
        socket.on('connect', () => {
            console.log('Connected to mining wallet server');
        });

        socket.on('walletData', (data) => {
            updateWallets(data);
        });

        socket.on('miningStatus', (status) => {
            updateMiningStatus(status);
        });

        socket.on('systemHealth', (health) => {
            updateSystemHealth(health);
        });

        socket.on('miningOutput', (data) => {
            appendMiningOutput(data);
        });

        socket.on('miningEvent', (event) => {
            appendMiningOutput({
                coin: event.coin,
                output: \`[\${event.type.toUpperCase()}] \${event.coin} mining \${event.type}\`,
                type: 'event'
            });
        });

        function updateWallets(data) {
            const container = document.getElementById('wallets');
            if (!data || data.error) {
                container.innerHTML = '<div>No wallet data available</div>';
                return;
            }

            let html = '';
            for (const [coin, wallet] of Object.entries(data.addresses || {})) {
                html += \`
                    <div class="wallet-item">
                        <div>
                            <strong>\${wallet.name} (\${wallet.symbol})</strong><br>
                            <div class="address">\${wallet.address}</div>
                            <small>Algorithm: \${wallet.algorithm}</small>
                        </div>
                    </div>
                \`;
            }
            
            html += \`<div class="timestamp">Generated: \${new Date(data.generated).toLocaleString()}</div>\`;
            container.innerHTML = html;
        }

        function updateMiningStatus(status) {
            const container = document.getElementById('mining-status');
            let html = '';

            if (Object.keys(status).length === 0) {
                html = '<div>No mining processes active</div>';
            } else {
                for (const [coin, info] of Object.entries(status)) {
                    const statusClass = info.running ? 'status-running' : 'status-stopped';
                    const statusText = info.running ? 'Running' : 'Stopped';
                    const uptime = info.uptime ? formatUptime(info.uptime) : '';
                    
                    html += \`
                        <div class="mining-item">
                            <div>
                                <span class="status-indicator \${statusClass}"></span>
                                <strong>\${coin.toUpperCase()}</strong>
                                <div>Status: \${statusText} \${uptime}</div>
                            </div>
                            <div>
                                \${info.running ? 
                                    \`<button class="stop" onclick="stopMining('\${coin}')">Stop</button>\` :
                                    \`<button onclick="startMining('\${coin}')">Start</button>\`
                                }
                            </div>
                        </div>
                    \`;
                }
            }

            container.innerHTML = html;
        }

        function updateSystemHealth(health) {
            const container = document.getElementById('system-health');
            const healthPercentage = health.summary?.healthPercentage || '0.0';
            
            let html = \`
                <div class="health-summary">
                    \${healthPercentage}% Healthy (\${health.summary?.healthy || 0}/\${health.summary?.total || 0})
                </div>
            \`;

            if (health.rpc) {
                for (const [coin, status] of Object.entries(health.rpc)) {
                    const statusClass = status.status === 'healthy' ? 'status-healthy' : 'status-unhealthy';
                    const responseTime = status.responseTime ? \`(\${status.responseTime}ms)\` : '';
                    
                    html += \`
                        <div class="wallet-item">
                            <div>
                                <span class="status-indicator \${statusClass}"></span>
                                <strong>\${coin.toUpperCase()}</strong>
                                <div>\${status.status} \${responseTime}</div>
                            </div>
                        </div>
                    \`;
                }
            }

            html += \`<div class="timestamp">Last check: \${new Date(health.timestamp).toLocaleTimeString()}</div>\`;
            container.innerHTML = html;
        }

        function appendMiningOutput(data) {
            const container = document.getElementById('mining-output');
            const timestamp = new Date().toLocaleTimeString();
            const prefix = data.type === 'error' ? 'ERROR' : data.type === 'event' ? 'EVENT' : 'OUTPUT';
            
            container.innerHTML += \`[\${timestamp}] [\${data.coin?.toUpperCase() || 'SYSTEM'}] [\${prefix}] \${data.output}<br>\`;
            container.scrollTop = container.scrollHeight;
        }

        function startMining(coin) {
            fetch(\`/api/mining/start/\${coin}\`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    console.log('Start mining response:', data);
                    if (!data.success) {
                        appendMiningOutput({
                            coin: coin,
                            output: \`Failed to start: \${data.message}\`,
                            type: 'error'
                        });
                    }
                })
                .catch(err => console.error('Error starting mining:', err));
        }

        function stopMining(coin) {
            fetch(\`/api/mining/stop/\${coin}\`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    console.log('Stop mining response:', data);
                    if (!data.success) {
                        appendMiningOutput({
                            coin: coin,
                            output: \`Failed to stop: \${data.message}\`,
                            type: 'error'
                        });
                    }
                })
                .catch(err => console.error('Error stopping mining:', err));
        }

        function formatUptime(ms) {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            if (hours > 0) {
                return \`(\${hours}h \${minutes % 60}m)\`;
            } else if (minutes > 0) {
                return \`(\${minutes}m \${seconds % 60}s)\`;
            } else {
                return \`(\${seconds}s)\`;
            }
        }

        // Initialize
        fetch('/api/wallets').then(res => res.json()).then(updateWallets);
        fetch('/api/mining/status').then(res => res.json()).then(updateMiningStatus);
        fetch('/api/health').then(res => res.json()).then(updateSystemHealth);
    </script>
</body>
</html>`;

        fs.writeFileSync('public/index.html', html);
        console.log('✅ Created web interface: public/index.html');
    }
}

// Start the UI server
const ui = new MiningWalletUI();
ui.start();
