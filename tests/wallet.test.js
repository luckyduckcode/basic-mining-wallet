const bip39 = require('bip39');
const hdkey = require('hdkey');
const { BitcoinWallet } = require('../src/wallet-core/bitcoin-wallet');
const { MoneroWallet } = require('../src/wallet-core/monero-wallet');
const { EthereumWallet } = require('../src/wallet-core/ethereum-wallet');
const { RavencoinWallet } = require('../src/wallet-core/ravencoin-wallet');
const { ErgoWallet } = require('../src/wallet-core/ergo-wallet');
const { ConfluxWallet } = require('../src/wallet-core/conflux-wallet');

describe('BIP 39 Multi-Wallet', () => {
  let mnemonic;
  let seed;
  let root;

  beforeAll(async () => {
    mnemonic = bip39.generateMnemonic();
    seed = await bip39.mnemonicToSeed(mnemonic);
    root = hdkey.fromMasterSeed(seed);
  });

  test('should generate valid BIP 39 mnemonic', () => {
    expect(bip39.validateMnemonic(mnemonic)).toBe(true);
    expect(mnemonic.split(' ').length).toBe(12);
  });

  test('should create Bitcoin wallet from HD key', () => {
    const bitcoinWallet = new BitcoinWallet(root);

    expect(bitcoinWallet.address).toBeDefined();
    expect(bitcoinWallet.address.startsWith('1')).toBe(true);
    expect(bitcoinWallet.privateKey).toBeDefined();
    expect(bitcoinWallet.publicKey).toBeDefined();
  });

  test('should create Ethereum wallet from HD key', () => {
    const ethereumWallet = new EthereumWallet(root);

    expect(ethereumWallet.address).toBeDefined();
    expect(ethereumWallet.address.startsWith('0x')).toBe(true);
    expect(ethereumWallet.privateKey).toBeDefined();
    expect(ethereumWallet.publicKey).toBeDefined();
  });

  test('should create Ravencoin wallet from HD key', () => {
    const ravencoinWallet = new RavencoinWallet(root);

    expect(ravencoinWallet.address).toBeDefined();
    expect(ravencoinWallet.address.startsWith('R')).toBe(true);
    expect(ravencoinWallet.privateKey).toBeDefined();
    expect(ravencoinWallet.publicKey).toBeDefined();
  });

  test('should create Ergo wallet from HD key', () => {
    const ergoWallet = new ErgoWallet(root);

    expect(ergoWallet.address).toBeDefined();
    expect(ergoWallet.privateKey).toBeDefined();
    expect(ergoWallet.publicKey).toBeDefined();
  });

  test('should create Conflux wallet from HD key', () => {
    const confluxWallet = new ConfluxWallet(root);

    expect(confluxWallet.address).toBeDefined();
    expect(confluxWallet.address.startsWith('cfx:')).toBe(true);
    expect(confluxWallet.privateKey).toBeDefined();
    expect(confluxWallet.publicKey).toBeDefined();
  });

  test('should derive different addresses from same seed', async () => {
    const seed2 = await bip39.mnemonicToSeed(mnemonic);
    const root2 = hdkey.fromMasterSeed(seed2);

    const bitcoinWallet1 = new BitcoinWallet(root);
    const bitcoinWallet2 = new BitcoinWallet(root2);

    expect(bitcoinWallet1.address).toBe(bitcoinWallet2.address);
  });

  test('should generate different addresses for different paths', async () => {
    const child1 = root.derive("m/44'/0'/0'/0/0");
    const child2 = root.derive("m/44'/0'/0'/0/1");

    const bitcoinWallet1 = new BitcoinWallet(child1);
    const bitcoinWallet2 = new BitcoinWallet(child2);

    expect(bitcoinWallet1.address).not.toBe(bitcoinWallet2.address);
  });
});
