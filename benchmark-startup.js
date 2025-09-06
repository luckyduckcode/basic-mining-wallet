const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Testing wallet startup performance...\n');

const startTime = process.hrtime.bigint();

const server = spawn('node', ['index.js'], {
  cwd: path.join(__dirname),
  stdio: ['pipe', 'pipe', 'pipe']
});

let startupComplete = false;
let startupTime = 0;

server.stdout.on('data', (data) => {
  const output = data.toString();

  if (output.includes('Basic Mining Wallet started in') && !startupComplete) {
    const endTime = process.hrtime.bigint();
    startupTime = Number(endTime - startTime) / 1e6; // Convert to milliseconds
    startupComplete = true;

    console.log(`✅ Server startup time: ${startupTime.toFixed(2)}ms`);

    if (startupTime < 500) {
      console.log('🚀 Excellent! Startup time under 500ms');
    } else if (startupTime < 1000) {
      console.log('⚡ Good! Startup time under 1 second');
    } else {
      console.log('🐌 Startup could be faster - consider further optimizations');
    }

    // Test a quick API call
    setTimeout(() => {
      testAPI();
    }, 100);
  }

  if (output.includes('Database connected')) {
    console.log('📊 Database connection established');
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

function testAPI() {
  const http = require('http');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        console.log(`🏥 Health check: ${health.status}`);
        console.log(`⏱️  Uptime: ${health.uptime.toFixed(2)}s`);
        console.log(`📦 Loaded modules: ${health.modules.join(', ')}`);

        // Stop the server
        server.kill();
        process.exit(0);
      } catch (e) {
        console.error('Failed to parse health response');
        server.kill();
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.error('API test failed:', e.message);
    server.kill();
    process.exit(1);
  });

  req.end();
}

// Timeout after 10 seconds
setTimeout(() => {
  if (!startupComplete) {
    console.log('❌ Server startup timeout after 10 seconds');
    server.kill();
    process.exit(1);
  }
}, 10000);
