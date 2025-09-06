# Basic Mining Wallet - AI Agent Instructions

## Project Overview
**Basic Mining Wallet** is a comprehensive cryptocurrency wallet suite for miners with integrated exchange functionality. Focuses on Monero (XMR) privacy and Bitcoin (BTC) mainstream adoption, combining mining rewards management with efficient crypto exchange capabilities.

## Architecture & Technology Stack

### Core Components (Implemented)
- `src/wallet-core/` - BIP 39 HD wallet implementation, multi-currency support
- `src/mining-integration/` - GMiner integration, pool connectivity, hardware monitoring
- `src/exchange-engine/` - Internal order matching, external API integration
- `src/security/` - AES-256 encryption, JWT authentication, multi-sig support

### Key Technologies
- **Backend**: Node.js 18+, Express, MongoDB with Mongoose
- **Blockchain**: Bitcoin Core RPC, Monero Daemon RPC, Web3.js
- **Wallet**: BIP 39, HD keys, multi-currency support (BTC, XMR, ETH, RVN, ERG, CFX)
- **Mining**: GMiner integration, pool APIs, hardware monitoring
- **Security**: AES-256 encryption, multi-sig, hardware wallet support
- **Testing**: Jest with coverage reporting
- **Code Quality**: ESLint, Prettier formatting

## Development Workflow

### Essential Commands
```bash
npm run dev          # Start development server with nodemon
npm test            # Run Jest tests
npm run test:coverage  # Generate coverage reports
npm run lint        # ESLint code checking
npm run format      # Prettier code formatting
```

### Commit Conventions
Use conventional commits with types: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

Example:
```bash
git commit -m "feat: implement multi-sig wallet creation

- Add HD wallet derivation for multi-sig addresses
- Implement signature collection workflow
- Add validation for quorum requirements
- Update wallet backup for multi-sig keys"
```

### Branch Naming
- `feature/add-wallet-encryption` - New features
- `bugfix/fix-transaction-validation` - Bug fixes
- `docs/update-api-documentation` - Documentation

## Security-First Development

### Critical Security Patterns
- **Never commit sensitive data** - Use `.env` for all secrets
- **Encrypt wallet data** - AES-256 for stored keys and backups
- **Multi-sig implementation** - Require multiple signatures for large transactions
- **Hardware security** - Integrate with Ledger/Trezor for key operations
- **Input validation** - Sanitize all blockchain addresses and amounts

### Environment Setup
```bash
cp .env.example .env
# Configure: MONERO_RPC_URL, BITCOIN_RPC_URL, MONGODB_URI, JWT_SECRET
```

## Mining Integration Patterns

### Pool Integration
- Support major mining pools (Antpool, F2Pool, etc.)
- Real-time statistics via pool APIs
- Automatic reward detection and consolidation
- Profitability calculations with electricity costs

### Hardware Monitoring
- ASIC/GPU temperature and performance tracking
- Alert system for hardware failures
- Remote management capabilities
- Efficiency optimization algorithms

## Exchange Implementation

### Internal Exchange Engine
- Order matching with price-time priority
- Liquidity aggregation from multiple sources
- Best execution algorithms for miner offboarding
- Arbitrage detection across exchanges

### External API Integration
- Binance, Coinbase, Kraken API connections
- Rate limiting and error handling
- Balance synchronization
- Secure API key management

## Code Patterns & Conventions

### Wallet Creation Example
```javascript
// Generate BIP 39 mnemonic
const mnemonic = bip39.generateMnemonic();

// Create HD wallet
const seed = await bip39.mnemonicToSeed(mnemonic);
const root = hdkey.fromMasterSeed(seed);

// Create multi-currency wallets (GMiner-supported cryptocurrencies)
const bitcoinWallet = new BitcoinWallet(root);
const moneroWallet = new MoneroWallet(root);
const ethereumWallet = new EthereumWallet(root);
const ravencoinWallet = new RavencoinWallet(root);
const ergoWallet = new ErgoWallet(root);
const confluxWallet = new ConfluxWallet(root);

console.log('Bitcoin address:', bitcoinWallet.address);
console.log('Ethereum address:', ethereumWallet.address);
console.log('Ravencoin address:', ravencoinWallet.address);
```

### GMiner Integration Example
```javascript
const gminer = new GMinerIntegration(config);

// Start mining with different algorithms
await gminer.startMining('ethash', 'antpool', '0x123...'); // Ethereum
await gminer.startMining('kawpow', 'f2pool', 'Rabc...'); // Ravencoin
await gminer.startMining('autolykos', 'pool', '9abc...'); // Ergo
await gminer.startMining('octopus', 'pool', 'cfx:...'); // Conflux

// Get stats
const stats = gminer.getStats();
console.log('Hashrate:', stats.hashrate);

// Monitor hardware
const hardware = await gminer.monitorHardware();
console.log('GPU temp:', hardware.gpus[0].temperature);
```

### Transaction Handling
```javascript
const processTransaction = async (txData) => {
  // Validate inputs
  validateTransaction(txData);

  // Check balance
  const balance = await getWalletBalance(txData.from);

  // Calculate fees
  const fee = calculateOptimalFee(txData, network);

  // Sign transaction
  const signedTx = await signTransaction(txData, wallet);

  // Broadcast
  return await broadcastTransaction(signedTx);
};
```

## Testing Requirements

### Test Coverage Targets
- **Core wallet functions**: 90%+ coverage
- **Security modules**: 100% coverage
- **Exchange engine**: 85%+ coverage
- **API endpoints**: 80%+ coverage

### Test Structure
```javascript
describe('Wallet Creation', () => {
  test('creates valid HD wallet', async () => {
    const wallet = await createWallet({ type: 'bitcoin' });
    expect(wallet.address).toMatch(/^[13]/);
    expect(wallet.privateKey).toBeDefined();
  });

  test('encrypts wallet data', async () => {
    const encrypted = await encryptWallet(testWallet, 'password');
    expect(encrypted).not.toContain('privateKey');
  });
});
```

## Key Files & Directories

### Core Implementation
- `src/wallet-core/index.js` - BIP 39 wallet API endpoints
- `src/wallet-core/bitcoin-wallet.js` - Bitcoin wallet implementation
- `src/wallet-core/monero-wallet.js` - Monero wallet implementation
- `src/mining-integration/index.js` - GMiner and pool integration
- `src/exchange-engine/index.js` - Trading engine and external APIs
- `src/security/index.js` - Encryption and authentication
- `tests/wallet.test.js` - BIP 39 wallet tests

### Documentation
- `README.md` - Project overview and setup
- `ROADMAP.md` - Development phases and milestones
- `CONTRIBUTING.md` - Development workflow and standards

## Common Pitfalls to Avoid

1. **Don't hardcode private keys** - Always use environment variables
2. **Validate all inputs** - Especially blockchain addresses and transaction amounts
3. **Handle network failures** - Implement retry logic for RPC calls
4. **Log security events** - But never log sensitive data
5. **Test on testnet first** - Never deploy untested code to mainnet

## Performance Optimizations

### Fast Startup (< 200ms)
- **Lazy loading** - All wallet implementations loaded on-demand
- **Non-blocking database** - MongoDB connects asynchronously after server starts
- **Minimal initial load** - Only essential middleware loaded at startup
- **Module caching** - Frequently used modules cached in memory

### Caching System
- **HD key cache** - Derived keys cached for 5 minutes with TTL
- **Address cache** - Generated addresses cached to avoid recomputation
- **Wallet instance cache** - Wallet objects cached for quick access
- **LRU eviction** - Automatic cleanup of old cache entries

### Optimized Operations
- **Fast validation** - Quick mnemonic length check before full BIP39 validation
- **Pre-computed values** - Common cryptographic values pre-calculated
- **Memory efficient** - Only load crypto libraries when needed
- **Streamlined parsing** - Optimized JSON and URL parsing</content>
<parameter name="filePath">c:\Projects\basic-mining-wallet\.github\copilot-instructions.md
