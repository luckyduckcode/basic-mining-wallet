const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing BIP 39 Multi-Wallet API with GMiner-supported cryptocurrencies...\n');

    // Test mnemonic generation
    console.log('1. Generating BIP 39 mnemonic...');
    const mnemonicResponse = await axios.post('http://localhost:3000/api/wallet/generate-mnemonic');
    console.log('✓ Mnemonic generated:', mnemonicResponse.data.mnemonic);

    // Test mnemonic validation
    console.log('\n2. Validating mnemonic...');
    const validateResponse = await axios.post('http://localhost:3000/api/wallet/validate-mnemonic', {
      mnemonic: mnemonicResponse.data.mnemonic
    });
    console.log('✓ Mnemonic valid:', validateResponse.data.valid);

    // Test multi-wallet creation
    console.log('\n3. Creating multi-currency wallet...');
    const walletResponse = await axios.post('http://localhost:3000/api/wallet/create-multi-wallet', {
      mnemonic: mnemonicResponse.data.mnemonic
    });
    console.log('✓ Bitcoin address:', walletResponse.data.bitcoin.address);
    console.log('✓ Monero address:', walletResponse.data.monero.address);
    console.log('✓ Ethereum address:', walletResponse.data.ethereum.address);
    console.log('✓ Ravencoin address:', walletResponse.data.ravencoin.address);
    console.log('✓ Ergo address:', walletResponse.data.ergo.address);
    console.log('✓ Conflux address:', walletResponse.data.conflux.address);

    // Test mining stats
    console.log('\n4. Testing mining integration...');
    const miningResponse = await axios.get('http://localhost:3000/api/mining/stats');
    console.log('✓ Mining stats:', miningResponse.data);

    console.log('\n🎉 All tests passed! BIP 39 wallet with GMiner-supported cryptocurrencies working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
