const bip39 = require('bip39');
const hdkey = require('hdkey');
const { EthereumWallet } = require('./src/wallet-core/ethereum-wallet');
const { BitcoinWallet } = require('./src/wallet-core/bitcoin-wallet');

async function demoSendReceive() {
  console.log('🚀 Basic Mining Wallet - Send & Receive Demo\n');

  // Step 1: Generate wallet from mnemonic
  console.log('📝 Step 1: Creating wallet from mnemonic...');
  const mnemonic = 'deer begin security project car pyramid inmate use pupil leopard palace title';
  console.log(`Mnemonic: ${mnemonic}\n`);

  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);

  // Create wallets
  const ethWallet = new EthereumWallet(root);
  const btcWallet = new BitcoinWallet(root);

  console.log('💰 Your Wallet Addresses:');
  console.log(`   Ethereum: ${ethWallet.address}`);
  console.log(`   Bitcoin:  ${btcWallet.address}\n`);

  // Step 2: Simulate receiving crypto
  console.log('📥 Step 2: Receiving crypto...');
  console.log('   Imagine someone sends you 0.5 ETH and 0.001 BTC...');
  console.log('   ✅ Received 0.5 ETH');
  console.log('   ✅ Received 0.001 BTC\n');

  // Step 3: Send Ethereum
  console.log('📤 Step 3: Sending Ethereum...');
  const ethTxData = {
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    value: '0x' + (0.1 * 1e18).toString(16), // 0.1 ETH
    gasLimit: '0x5208',
    gasPrice: '0x09184e72a000',
    nonce: 0,
    chainId: 1
  };

  const ethSignature = ethWallet.signTransaction(ethTxData);
  console.log(`   📋 Transaction to: ${ethTxData.to}`);
  console.log(`   💰 Amount: 0.1 ETH`);
  console.log(`   ✍️  Signature: ${ethSignature.signature.substring(0, 42)}...`);
  console.log('   ✅ Transaction signed and ready to broadcast!\n');

  // Step 4: Send Bitcoin
  console.log('₿ Step 4: Sending Bitcoin...');
  const btcTxData = {
    inputs: [{ txid: 'a'.repeat(64), vout: 0 }],
    outputs: [{ address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 10000 }] // 0.0001 BTC
  };

  const btcSignature = btcWallet.signTransaction(btcTxData);
  console.log(`   📋 Transaction to: ${btcTxData.outputs[0].address}`);
  console.log(`   💰 Amount: 0.0001 BTC`);
  console.log(`   ✍️  Signature: ${btcSignature.signature.substring(0, 42)}...`);
  console.log('   ✅ Transaction signed and ready to broadcast!\n');

  // Step 5: Message signing demo
  console.log('📨 Step 5: Message signing (for authentication)...');
  const message = 'Login to Basic Mining Wallet';
  const ethMessageSig = ethWallet.signMessage(message);
  console.log(`   Message: "${message}"`);
  console.log(`   ✍️  Signature: ${ethMessageSig.signature.substring(0, 42)}...`);
  console.log('   ✅ Message signed for authentication!\n');

  console.log('🎉 Demo completed successfully!');
  console.log('\n📋 Summary:');
  console.log('   • ✅ Wallet creation from BIP39 mnemonic');
  console.log('   • ✅ Multi-currency support (ETH, BTC)');
  console.log('   • ✅ Transaction signing');
  console.log('   • ✅ Message signing for authentication');
  console.log('   • ✅ Ready for blockchain broadcasting');

  console.log('\n🔗 Next Steps:');
  console.log('   1. Start the server: npm run dev');
  console.log('   2. Open wallet dashboard: http://localhost:3000/wallet');
  console.log('   3. Use the web interface to send/receive crypto');
  console.log('   4. Configure RPC endpoints for live blockchain interaction');
}

demoSendReceive().catch(console.error);
