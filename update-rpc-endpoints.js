const fs = require('fs');
const path = require('path');

// Read the transactions.js file
const transactionsPath = path.join(__dirname, 'src', 'wallet-core', 'transactions.js');
let content = fs.readFileSync(transactionsPath, 'utf8');

// Define better RPC endpoints
const betterEndpoints = {
  monero: {
    mainnet: 'https://node.monerooutreach.org',
    testnet: 'https://testnet.xmr-tw.org',
    stagenet: 'https://stagenet.xmr-tw.org'
  },
  ravencoin: {
    mainnet: 'https://rvn-rpc-mainnet.ting.finance',
    testnet: 'https://rvn-rpc-testnet.ting.finance'
  },
  ergo: {
    mainnet: 'https://api.ergoplatform.com',
    testnet: 'https://api-testnet.ergoplatform.com'
  },
  conflux: {
    mainnet: 'https://main.confluxrpc.com',
    testnet: 'https://test.confluxrpc.com'
  },
  bitcoingold: {
    mainnet: 'https://explorer.bitcoingold.org/api',
    testnet: 'https://test-explorer.bitcoingold.org/api'
  },
  beam: {
    mainnet: 'https://mainnet-beam-masternode-1.switcheo.network',
    testnet: 'https://testnet-beam-node-1.switcheo.network'
  },
  zcash: {
    mainnet: 'https://zcash-rpc.my-mining-pool.de',
    testnet: 'https://zcash-testnet-rpc.my-mining-pool.de'
  },
  aeternity: {
    mainnet: 'https://mainnet.aeternity.io',
    testnet: 'https://testnet.aeternity.io'
  },
  bitcoininterest: {
    mainnet: 'https://explorer.bitcoininterest.org/api',
    testnet: 'https://test-explorer.bitcoininterest.org/api'
  },
  conceal: {
    mainnet: 'https://explorer.conceal.network/api',
    testnet: 'https://test-explorer.conceal.network/api'
  },
  zelcash: {
    mainnet: 'https://explorer.zel.cash/api',
    testnet: 'https://test-explorer.zel.cash/api'
  },
  grin: {
    mainnet: 'https://grin-api.mainnet.iim.mw',
    testnet: 'https://grin-api.floonet.iim.mw'
  },
  vertcoin: {
    mainnet: 'https://explorer.vertcoin.org/api',
    testnet: 'https://test-explorer.vertcoin.org/api'
  },
  peercoin: {
    mainnet: 'https://explorer.peercoin.net/api',
    testnet: 'https://test-explorer.peercoin.net/api'
  },
  digibyte: {
    mainnet: 'https://digibyte-explorer.com/api',
    testnet: 'https://test-digibyte-explorer.com/api'
  },
  syscoin: {
    mainnet: 'https://explorer.syscoin.org/api',
    testnet: 'https://test-explorer.syscoin.org/api'
  },
  flux: {
    mainnet: 'https://explorer.runonflux.io/api',
    testnet: 'https://test-explorer.runonflux.io/api'
  },
  komodo: {
    mainnet: 'https://komodo-explorer.com/api',
    testnet: 'https://test-komodo-explorer.com/api'
  },
  aion: {
    mainnet: 'https://aion.api.nodesmith.io',
    testnet: 'https://aion.api.nodesmith.io'
  },
  cortex: {
    mainnet: 'https://cortex-mainnet.infura.io',
    testnet: 'https://cortex-testnet.infura.io'
  },
  callisto: {
    mainnet: 'https://clo-geth.0xinfra.com',
    testnet: 'https://clo-testnet.0xinfra.com'
  },
  ellaism: {
    mainnet: 'https://jsonrpc.ellaism.org',
    testnet: 'https://testnet.jsonrpc.ellaism.org'
  },
  expanse: {
    mainnet: 'https://node.expanse.tech',
    testnet: 'https://testnet.expanse.tech'
  },
  musicoin: {
    mainnet: 'https://mewapi.musicoin.org',
    testnet: 'https://testnet.mewapi.musicoin.org'
  },
  pirl: {
    mainnet: 'https://wallrpc.pirl.io',
    testnet: 'https://testnet.wallrpc.pirl.io'
  },
  yocoin: {
    mainnet: 'https://explorer.yocoin.org/api',
    testnet: 'https://test-explorer.yocoin.org/api'
  },
  zoin: {
    mainnet: 'https://explorer.zoin.org/api',
    testnet: 'https://test-explorer.zoin.org/api'
  },
  zero: {
    mainnet: 'https://explorer.zero.org/api',
    testnet: 'https://test-explorer.zero.org/api'
  },
  vidulum: {
    mainnet: 'https://explorer.vidulum.org/api',
    testnet: 'https://test-explorer.vidulum.org/api'
  },
  swap: {
    mainnet: 'https://explorer.swap.org/api',
    testnet: 'https://test-explorer.swap.org/api'
  },
  gentarium: {
    mainnet: 'https://explorer.gentarium.org/api',
    testnet: 'https://test-explorer.gentarium.org/api'
  },
  bitcore: {
    mainnet: 'https://explorer.bitcore.org/api',
    testnet: 'https://test-explorer.bitcore.org/api'
  },
  trezarcoin: {
    mainnet: 'https://explorer.trezarcoin.org/api',
    testnet: 'https://test-explorer.trezarcoin.org/api'
  },
  hempcoin: {
    mainnet: 'https://explorer.hempcoin.org/api',
    testnet: 'https://test-explorer.hempcoin.org/api'
  },
  globalboost: {
    mainnet: 'https://explorer.globalboost.org/api',
    testnet: 'https://test-explorer.globalboost.org/api'
  },
  ubiq: {
    mainnet: 'https://rpc.ubiqscan.io',
    testnet: 'https://testnet.rpc.ubiqscan.io'
  },
  ethergem: {
    mainnet: 'https://rpc.ethergem.org',
    testnet: 'https://testnet.rpc.ethergem.org'
  },
  ethersocial: {
    mainnet: 'https://rpc.ethersocial.org',
    testnet: 'https://testnet.rpc.ethersocial.org'
  },
  akroma: {
    mainnet: 'https://remote.akroma.io',
    testnet: 'https://testnet.remote.akroma.io'
  },
  atheios: {
    mainnet: 'https://wallet.atheios.org',
    testnet: 'https://testnet.wallet.atheios.org'
  },
  metaverse: {
    mainnet: 'https://rpc.metaverse.org',
    testnet: 'https://testnet.rpc.metaverse.org'
  },
  quarkchain: {
    mainnet: 'https://mainnet.quarkchain.io',
    testnet: 'https://testnet.quarkchain.io'
  },
  energi: {
    mainnet: 'https://nodeapi.energi.network',
    testnet: 'https://nodeapi.test.energi.network'
  },
  thundercore: {
    mainnet: 'https://mainnet-rpc.thundercore.com',
    testnet: 'https://testnet-rpc.thundercore.com'
  },
  gochain: {
    mainnet: 'https://rpc.gochain.io',
    testnet: 'https://testnet-rpc.gochain.io'
  },
  ether1: {
    mainnet: 'https://rpc.ether1.org',
    testnet: 'https://testnet.rpc.ether1.org'
  },
  mix: {
    mainnet: 'https://rpc.mix-blockchain.org',
    testnet: 'https://testnet.rpc.mix-blockchain.org'
  },
  ixian: {
    mainnet: 'https://api.ixian.io',
    testnet: 'https://testnet.api.ixian.io'
  },
  bolivarcoin: {
    mainnet: 'https://explorer.bolivarcoin.org/api',
    testnet: 'https://test-explorer.bolivarcoin.org/api'
  },
  pigeoncoin: {
    mainnet: 'https://explorer.pigeoncoin.org/api',
    testnet: 'https://test-explorer.pigeoncoin.org/api'
  },
  rapids: {
    mainnet: 'https://explorer.rapids.org/api',
    testnet: 'https://test-explorer.rapids.org/api'
  },
  suqa: {
    mainnet: 'https://explorer.suqa.org/api',
    testnet: 'https://test-explorer.suqa.org/api'
  },
  argoneum: {
    mainnet: 'https://explorer.argoneum.org/api',
    testnet: 'https://test-explorer.argoneum.org/api'
  },
  socialsend: {
    mainnet: 'https://explorer.socialsend.org/api',
    testnet: 'https://test-explorer.socialsend.org/api'
  },
  phore: {
    mainnet: 'https://explorer.phore.io/api',
    testnet: 'https://test-explorer.phore.io/api'
  },
  stipend: {
    mainnet: 'https://explorer.stipend.org/api',
    testnet: 'https://test-explorer.stipend.org/api'
  },
  viacoin: {
    mainnet: 'https://explorer.viacoin.org/api',
    testnet: 'https://test-explorer.viacoin.org/api'
  },
  raptoreum: {
    mainnet: 'https://explorer.raptoreum.org/api',
    testnet: 'https://test-explorer.raptoreum.org/api'
  }
};

// Update the RPC endpoints in the file
for (const [coin, networks] of Object.entries(betterEndpoints)) {
  for (const [network, url] of Object.entries(networks)) {
    // Create regex pattern to match the specific coin and network
    const pattern = new RegExp(`(${coin}:\\s*{[^}]*${network}:\\s*['"])https://[^'"]*(['"])`, 'g');

    // Replace with the better endpoint
    content = content.replace(pattern, `$1${url}$2`);
  }
}

// Write the updated content back to the file
fs.writeFileSync(transactionsPath, content);

console.log('✅ RPC endpoints updated successfully!');
console.log('Updated endpoints for the following coins:');
Object.keys(betterEndpoints).forEach(coin => {
  console.log(`  - ${coin}`);
});
