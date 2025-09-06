const axios = require('axios');

async function testAutoConfig() {
  try {
    console.log('🧪 Testing Auto-Configuration API...\n');

    // Test quick start
    console.log('1. Testing quick-start configuration...');
    const quickStartResponse = await axios.post('http://localhost:3000/api/mining/config/quick-start', {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
    });

    console.log('✅ Quick start config generated');
    console.log('Command:', quickStartResponse.data.command);

    // Test hardware benchmark
    console.log('\n2. Testing hardware benchmark...');
    const benchmarkResponse = await axios.get('http://localhost:3000/api/mining/config/benchmark');

    console.log('✅ Hardware detected:');
    console.log(`   - GPUs: ${benchmarkResponse.data.results.length}`);
    benchmarkResponse.data.results.forEach(gpu => {
      console.log(`   - ${gpu.name}: ${gpu.ethash} MH/s Ethash`);
    });

    // Test profitability calculator
    console.log('\n3. Testing profitability calculator...');
    const profitResponse = await axios.post('http://localhost:3000/api/mining/config/profitability', {
      hashrate: 60,
      power: 150,
      electricityCost: 0.12,
      coin: 'ETH'
    });

    console.log('✅ Profitability calculated:');
    console.log(`   - Daily profit: $${profitResponse.data.dailyProfit}`);
    console.log(`   - Monthly profit: $${profitResponse.data.monthlyProfit}`);

    console.log('\n🎉 All auto-configuration tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAutoConfig();
