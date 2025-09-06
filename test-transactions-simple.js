// Simple test for transaction functionality without server
const crypto = require('crypto');
const { EthereumWallet } = require('./src/wallet-core/ethereum-wallet');
const { BitcoinWallet } = require('./src/wallet-core/bitcoin-wallet');
const hdkey = require('hdkey');
const bip39 = require('bip39');

async function testTransactionFunctionality() {
  console.log('🧪 Testing transaction functionality...\n');

  try {
    // Generate a test mnemonic
    console.log('📝 Generating test wallet...');
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = hdkey.fromMasterSeed(seed);

    // Test Ethereum wallet
    console.log('🔷 Testing Ethereum wallet...');
    const ethWallet = new EthereumWallet(root);
    console.log(`   Address: ${ethWallet.address}`);

    // Test transaction signing
    const txData = {
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      value: '0x' + (0.1 * 1e18).toString(16), // 0.1 ETH in wei
      gasLimit: '0x5208',
      gasPrice: '0x09184e72a000',
      nonce: 0,
      chainId: 1
    };

    const ethSignature = ethWallet.signTransaction(txData);
    console.log(`   ✅ Transaction signed: ${ethSignature.signature.substring(0, 42)}...`);

    // Test Bitcoin wallet
    console.log('₿ Testing Bitcoin wallet...');
    const btcWallet = new BitcoinWallet(root);
    console.log(`   Address: ${btcWallet.address}`);

    const btcTxData = {
      inputs: [{ txid: 'a'.repeat(64), vout: 0 }],
      outputs: [{ address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 50000 }]
    };

    const btcSignature = btcWallet.signTransaction(btcTxData);
    console.log(`   ✅ Transaction signed: ${btcSignature.signature.substring(0, 42)}...`);

    // Test message signing
    console.log('📨 Testing message signing...');
    const message = 'Hello, Blockchain!';
    const ethMessageSig = ethWallet.signMessage(message);
    console.log(`   ✅ Ethereum message signed: ${ethMessageSig.signature.substring(0, 42)}...`);

    const btcMessageSig = btcWallet.signMessage(message);
    console.log(`   ✅ Bitcoin message signed: ${btcMessageSig.signature.substring(0, 42)}...`);

    console.log('\n🎉 All transaction functionality tests passed!');
    console.log('\n📋 Test Results:');
    console.log(`   • Mnemonic: ${mnemonic}`);
    console.log(`   • ETH Address: ${ethWallet.address}`);
    console.log(`   • BTC Address: ${btcWallet.address}`);
    console.log('   • Transaction signing: ✅ Working');
    console.log('   • Message signing: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

testTransactionFunctionality();
