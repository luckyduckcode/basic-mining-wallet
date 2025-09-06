const { MiningConfigGenerator } = require('./src/mining-integration/config-generator');

async function testTransactionAPI() {
  console.log('🧪 Testing transaction API functionality...\n');

  try {
    // Test balance checking
    console.log('📊 Testing balance checking...');
    const balanceResponse = await fetch('http://localhost:3000/api/wallet/transaction/balance/bitcoin/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    const balanceData = await balanceResponse.json();
    console.log('✅ Balance check response:', balanceData);

    // Test fee estimation
    console.log('\n💰 Testing fee estimation...');
    const feeResponse = await fetch('http://localhost:3000/api/wallet/transaction/estimate-fee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coin: 'bitcoin' })
    });
    const feeData = await feeResponse.json();
    console.log('✅ Fee estimation response:', feeData);

    console.log('\n🎉 Transaction API test completed successfully!');

  } catch (error) {
    console.error('❌ Transaction API test failed:', error);
    console.log('Note: Make sure the server is running with: npm run dev');
  }
}

// Test mining config generation
async function testMiningConfig() {
  console.log('\n⛏️ Testing mining configuration generation...');

  const configGenerator = new MiningConfigGenerator();
  const walletData = {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    coin: 'ETH'
  };

  try {
    const configs = await configGenerator.generateUnifiedConfig(walletData, 'gminer');
    console.log('✅ Mining config generated for:', Object.keys(configs.configurations));
  } catch (error) {
    console.error('❌ Mining config test failed:', error);
  }
}

// Run tests
async function runTests() {
  await testTransactionAPI();
  await testMiningConfig();
}

runTests();
