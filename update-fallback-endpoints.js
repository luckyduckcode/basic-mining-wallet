const fs = require('fs');
const path = require('path');

// Updated RPC endpoints from research
const updatedEndpoints = {
  monero: {
    mainnet: 'https://monero.fail',
    testnet: 'https://monero.fail'
  },
  bitcoingold: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  beam: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  aeternity: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  bitcoininterest: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  conceal: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  zelcash: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  peercoin: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  aion: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  cortex: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  callisto: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  ellaism: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  musicoin: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  pirl: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  yocoin: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  zoin: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  zero: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  vidulum: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  swap: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  gentarium: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  bitcore: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  trezarcoin: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  hempcoin: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  globalboost: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  ethergem: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  ethersocial: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  akroma: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  atheios: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  metaverse: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  quarkchain: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  ether1: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  mix: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  ixian: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  bolivarcoin: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  pigeoncoin: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  rapids: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  suqa: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  argoneum: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  socialsend: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  phore: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  stipend: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  },
  raptoreum: {
    mainnet: 'https://api.smartbit.com.au/v1',
    testnet: 'https://api.smartbit.com.au/v1'
  }
};

// Read the transactions.js file
const transactionsPath = path.join(__dirname, 'src', 'wallet-core', 'transactions.js');
let content = fs.readFileSync(transactionsPath, 'utf8');

// Update the RPC endpoints in the file
for (const [coin, networks] of Object.entries(updatedEndpoints)) {
  for (const [network, url] of Object.entries(networks)) {
    // Create regex pattern to match the specific coin and network fallback URL
    const pattern = new RegExp(`(${coin}:\\s*{[^}]*${network}:\\s*process\\.env\\.[^|]*\\|\\|\\s*)'https://[^']*(${coin}-rpc\\.publicnode\\.com)'`, 'g');

    // Replace with the better endpoint
    content = content.replace(pattern, `$1'${url}'`);
  }
}

// Write the updated content back to the file
fs.writeFileSync(transactionsPath, content);

console.log('✅ RPC endpoints updated with fallback endpoints!');
console.log('Updated endpoints for the following coins:');
Object.keys(updatedEndpoints).forEach(coin => {
  console.log(`  - ${coin}`);
});
