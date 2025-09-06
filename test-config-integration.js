const { MiningConfigGenerator } = require('./src/mining-integration/config-generator');

async function testConfigGeneration() {
  console.log('🧪 Testing mining configuration generation...\n');

  const configGenerator = new MiningConfigGenerator();

  // Test wallet data
  const walletData = {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    coin: 'ETH',
    generatedAt: new Date().toISOString()
  };

  // Test different mining software
  const miningSoftware = ['gminer', 'trex', 'nbminer', 'lolminer'];

  for (const software of miningSoftware) {
    try {
      console.log(`📝 Generating ${software} configuration...`);
      const configs = await configGenerator.generateUnifiedConfig(walletData, software);

      console.log(`✅ ${software.toUpperCase()} config generated:`);
      console.log(`   - Algorithms supported: ${Object.keys(configs.configurations).length}`);
      console.log(`   - Wallet integrated: ${configs.wallet.address === walletData.address ? '✅' : '❌'}`);
      console.log(`   - Mining software: ${configs.miningSoftware}\n`);

    } catch (error) {
      console.error(`❌ Error with ${software}:`, error.message);
    }
  }

  console.log('🎉 Configuration generation test completed!');
}

testConfigGeneration().catch(console.error);
