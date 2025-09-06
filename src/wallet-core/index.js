const express = require('express');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const crypto = require('crypto');

// Import performance optimizations
const {
  deriveHdKey,
  fastValidateMnemonic,
  getCachedAddress,
  setCachedAddress
} = require('./performance');

// Import transaction module
const transactionRouter = require('./transactions');

// Lazy-loaded wallet cache
const walletCache = new Map();

const router = express.Router();

// Lazy wallet loaders
const lazyLoadBitcoinWallet = () => {
  if (!walletCache.has('bitcoin')) {
    walletCache.set('bitcoin', require('./bitcoin-wallet'));
  }
  return walletCache.get('bitcoin');
};

const lazyLoadMoneroWallet = () => {
  if (!walletCache.has('monero')) {
    walletCache.set('monero', require('./monero-wallet'));
  }
  return walletCache.get('monero');
};

const lazyLoadEthereumWallet = () => {
  if (!walletCache.has('ethereum')) {
    walletCache.set('ethereum', require('./ethereum-wallet'));
  }
  return walletCache.get('ethereum');
};

const lazyLoadRavencoinWallet = () => {
  if (!walletCache.has('ravencoin')) {
    walletCache.set('ravencoin', require('./ravencoin-wallet'));
  }
  return walletCache.get('ravencoin');
};

const lazyLoadErgoWallet = () => {
  if (!walletCache.has('ergo')) {
    walletCache.set('ergo', require('./ergo-wallet'));
  }
  return walletCache.get('ergo');
};

const lazyLoadBitcoingoldWallet = () => {
  if (!walletCache.has('bitcoingold')) {
    walletCache.set('bitcoingold', require('./bitcoingold-wallet'));
  }
  return walletCache.get('bitcoingold');
};

const lazyLoadBeamWallet = () => {
  if (!walletCache.has('beam')) {
    walletCache.set('beam', require('./beam-wallet'));
  }
  return walletCache.get('beam');
};

const lazyLoadZcashWallet = () => {
  if (!walletCache.has('zcash')) {
    walletCache.set('zcash', require('./zcash-wallet'));
  }
  return walletCache.get('zcash');
};

const lazyLoadAeternityWallet = () => {
  if (!walletCache.has('aeternity')) {
    walletCache.set('aeternity', require('./aeternity-wallet'));
  }
  return walletCache.get('aeternity');
};

const lazyLoadBitcoininterestWallet = () => {
  if (!walletCache.has('bitcoininterest')) {
    walletCache.set('bitcoininterest', require('./bitcoininterest-wallet'));
  }
  return walletCache.get('bitcoininterest');
};

const lazyLoadConcealWallet = () => {
  if (!walletCache.has('conceal')) {
    walletCache.set('conceal', require('./conceal-wallet'));
  }
  return walletCache.get('conceal');
};

const lazyLoadZelcashWallet = () => {
  if (!walletCache.has('zelcash')) {
    walletCache.set('zelcash', require('./zelcash-wallet'));
  }
  return walletCache.get('zelcash');
};

const lazyLoadGrinWallet = () => {
  if (!walletCache.has('grin')) {
    walletCache.set('grin', require('./grin-wallet'));
  }
  return walletCache.get('grin');
};

const lazyLoadVertcoinWallet = () => {
  if (!walletCache.has('vertcoin')) {
    walletCache.set('vertcoin', require('./vertcoin-wallet'));
  }
  return walletCache.get('vertcoin');
};

const lazyLoadPeercoinWallet = () => {
  if (!walletCache.has('peercoin')) {
    walletCache.set('peercoin', require('./peercoin-wallet'));
  }
  return walletCache.get('peercoin');
};

const lazyLoadDigibyteWallet = () => {
  if (!walletCache.has('digibyte')) {
    walletCache.set('digibyte', require('./digibyte-wallet'));
  }
  return walletCache.get('digibyte');
};

const lazyLoadSyscoinWallet = () => {
  if (!walletCache.has('syscoin')) {
    walletCache.set('syscoin', require('./syscoin-wallet'));
  }
  return walletCache.get('syscoin');
};

const lazyLoadFluxWallet = () => {
  if (!walletCache.has('flux')) {
    walletCache.set('flux', require('./flux-wallet'));
  }
  return walletCache.get('flux');
};

const lazyLoadKomodoWallet = () => {
  if (!walletCache.has('komodo')) {
    walletCache.set('komodo', require('./komodo-wallet'));
  }
  return walletCache.get('komodo');
};

const lazyLoadAionWallet = () => {
  if (!walletCache.has('aion')) {
    walletCache.set('aion', require('./aion-wallet'));
  }
  return walletCache.get('aion');
};

const lazyLoadCortexWallet = () => {
  if (!walletCache.has('cortex')) {
    walletCache.set('cortex', require('./cortex-wallet'));
  }
  return walletCache.get('cortex');
};

const lazyLoadCallistoWallet = () => {
  if (!walletCache.has('callisto')) {
    walletCache.set('callisto', require('./callisto-wallet'));
  }
  return walletCache.get('callisto');
};

const lazyLoadEllaismWallet = () => {
  if (!walletCache.has('ellaism')) {
    walletCache.set('ellaism', require('./ellaism-wallet'));
  }
  return walletCache.get('ellaism');
};

const lazyLoadExpanseWallet = () => {
  if (!walletCache.has('expanse')) {
    walletCache.set('expanse', require('./expanse-wallet'));
  }
  return walletCache.get('expanse');
};

const lazyLoadMusicoinWallet = () => {
  if (!walletCache.has('musicoin')) {
    walletCache.set('musicoin', require('./musicoin-wallet'));
  }
  return walletCache.get('musicoin');
};

const lazyLoadPirlWallet = () => {
  if (!walletCache.has('pirl')) {
    walletCache.set('pirl', require('./pirl-wallet'));
  }
  return walletCache.get('pirl');
};

const lazyLoadYocoinWallet = () => {
  if (!walletCache.has('yocoin')) {
    walletCache.set('yocoin', require('./yocoin-wallet'));
  }
  return walletCache.get('yocoin');
};

const lazyLoadZoinWallet = () => {
  if (!walletCache.has('zoin')) {
    walletCache.set('zoin', require('./zoin-wallet'));
  }
  return walletCache.get('zoin');
};

const lazyLoadZeroWallet = () => {
  if (!walletCache.has('zero')) {
    walletCache.set('zero', require('./zero-wallet'));
  }
  return walletCache.get('zero');
};

const lazyLoadVidulumWallet = () => {
  if (!walletCache.has('vidulum')) {
    walletCache.set('vidulum', require('./vidulum-wallet'));
  }
  return walletCache.get('vidulum');
};

const lazyLoadSwapWallet = () => {
  if (!walletCache.has('swap')) {
    walletCache.set('swap', require('./swap-wallet'));
  }
  return walletCache.get('swap');
};

const lazyLoadGentariumWallet = () => {
  if (!walletCache.has('gentarium')) {
    walletCache.set('gentarium', require('./gentarium-wallet'));
  }
  return walletCache.get('gentarium');
};

const lazyLoadBitcoreWallet = () => {
  if (!walletCache.has('bitcore')) {
    walletCache.set('bitcore', require('./bitcore-wallet'));
  }
  return walletCache.get('bitcore');
};

const lazyLoadTrezarcoinWallet = () => {
  if (!walletCache.has('trezarcoin')) {
    walletCache.set('trezarcoin', require('./trezarcoin-wallet'));
  }
  return walletCache.get('trezarcoin');
};

const lazyLoadHempcoinWallet = () => {
  if (!walletCache.has('hempcoin')) {
    walletCache.set('hempcoin', require('./hempcoin-wallet'));
  }
  return walletCache.get('hempcoin');
};

const lazyLoadGlobalboostWallet = () => {
  if (!walletCache.has('globalboost')) {
    walletCache.set('globalboost', require('./globalboost-wallet'));
  }
  return walletCache.get('globalboost');
};

const lazyLoadUbiqWallet = () => {
  if (!walletCache.has('ubiq')) {
    walletCache.set('ubiq', require('./ubiq-wallet'));
  }
  return walletCache.get('ubiq');
};

const lazyLoadEthergemWallet = () => {
  if (!walletCache.has('ethergem')) {
    walletCache.set('ethergem', require('./ethergem-wallet'));
  }
  return walletCache.get('ethergem');
};

const lazyLoadEtherSocialWallet = () => {
  if (!walletCache.has('ethersocial')) {
    walletCache.set('ethersocial', require('./ethersocial-wallet'));
  }
  return walletCache.get('ethersocial');
};

const lazyLoadAkromaWallet = () => {
  if (!walletCache.has('akroma')) {
    walletCache.set('akroma', require('./akroma-wallet'));
  }
  return walletCache.get('akroma');
};

const lazyLoadAtheiosWallet = () => {
  if (!walletCache.has('atheios')) {
    walletCache.set('atheios', require('./atheios-wallet'));
  }
  return walletCache.get('atheios');
};

const lazyLoadMetaverseWallet = () => {
  if (!walletCache.has('metaverse')) {
    walletCache.set('metaverse', require('./metaverse-wallet'));
  }
  return walletCache.get('metaverse');
};

const lazyLoadQuarkChainWallet = () => {
  if (!walletCache.has('quarkchain')) {
    walletCache.set('quarkchain', require('./quarkchain-wallet'));
  }
  return walletCache.get('quarkchain');
};

const lazyLoadEnergiWallet = () => {
  if (!walletCache.has('energi')) {
    walletCache.set('energi', require('./energi-wallet'));
  }
  return walletCache.get('energi');
};

const lazyLoadThunderCoreWallet = () => {
  if (!walletCache.has('thundercore')) {
    walletCache.set('thundercore', require('./thundercore-wallet'));
  }
  return walletCache.get('thundercore');
};

const lazyLoadGoChainWallet = () => {
  if (!walletCache.has('gochain')) {
    walletCache.set('gochain', require('./gochain-wallet'));
  }
  return walletCache.get('gochain');
};

const lazyLoadEther1Wallet = () => {
  if (!walletCache.has('ether1')) {
    walletCache.set('ether1', require('./ether1-wallet'));
  }
  return walletCache.get('ether1');
};

const lazyLoadMixWallet = () => {
  if (!walletCache.has('mix')) {
    walletCache.set('mix', require('./mix-wallet'));
  }
  return walletCache.get('mix');
};

const lazyLoadIxianWallet = () => {
  if (!walletCache.has('ixian')) {
    walletCache.set('ixian', require('./ixian-wallet'));
  }
  return walletCache.get('ixian');
};

const lazyLoadBolivarcoinWallet = () => {
  if (!walletCache.has('bolivarcoin')) {
    walletCache.set('bolivarcoin', require('./bolivarcoin-wallet'));
  }
  return walletCache.get('bolivarcoin');
};

const lazyLoadPigeoncoinWallet = () => {
  if (!walletCache.has('pigeoncoin')) {
    walletCache.set('pigeoncoin', require('./pigeoncoin-wallet'));
  }
  return walletCache.get('pigeoncoin');
};

const lazyLoadRapidsWallet = () => {
  if (!walletCache.has('rapids')) {
    walletCache.set('rapids', require('./rapids-wallet'));
  }
  return walletCache.get('rapids');
};

const lazyLoadSuqaWallet = () => {
  if (!walletCache.has('suqa')) {
    walletCache.set('suqa', require('./suqa-wallet'));
  }
  return walletCache.get('suqa');
};

const lazyLoadArgoneumWallet = () => {
  if (!walletCache.has('argoneum')) {
    walletCache.set('argoneum', require('./argoneum-wallet'));
  }
  return walletCache.get('argoneum');
};

const lazyLoadSocialSendWallet = () => {
  if (!walletCache.has('socialsend')) {
    walletCache.set('socialsend', require('./socialsend-wallet'));
  }
  return walletCache.get('socialsend');
};

const lazyLoadPhoreWallet = () => {
  if (!walletCache.has('phore')) {
    walletCache.set('phore', require('./phore-wallet'));
  }
  return walletCache.get('phore');
};

const lazyLoadStipendWallet = () => {
  if (!walletCache.has('stipend')) {
    walletCache.set('stipend', require('./stipend-wallet'));
  }
  return walletCache.get('stipend');
};

const lazyLoadViacoinWallet = () => {
  if (!walletCache.has('viacoin')) {
    walletCache.set('viacoin', require('./viacoin-wallet'));
  }
  return walletCache.get('viacoin');
};

const lazyLoadRaptoreumWallet = () => {
  if (!walletCache.has('raptoreum')) {
    walletCache.set('raptoreum', require('./raptoreum-wallet'));
  }
  return walletCache.get('raptoreum');
};

// Generate BIP 39 mnemonic
router.post('/generate-mnemonic', async (req, res) => {
  try {
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = hdkey.fromMasterSeed(seed);

    res.json({
      mnemonic,
      seed: seed.toString('hex'),
      rootKey: root.privateKey.toString('hex')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate BIP 39 mnemonic
router.post('/validate-mnemonic', (req, res) => {
  try {
    const { mnemonic } = req.body;
    const isValid = fastValidateMnemonic(mnemonic);

    // If fast check passes, do full validation
    if (isValid) {
      const fullValid = bip39.validateMnemonic(mnemonic);
      res.json({ valid: fullValid });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create multi-currency wallet from mnemonic
router.post('/create-multi-wallet', async (req, res) => {
  try {
    const { mnemonic, password } = req.body;

    if (!bip39.validateMnemonic(mnemonic)) {
      return res.status(400).json({ error: 'Invalid mnemonic' });
    }

    const seed = await bip39.mnemonicToSeed(mnemonic, password);
    const root = hdkey.fromMasterSeed(seed);

    // Fast wallet creation with caching
    const { BitcoinWallet } = lazyLoadBitcoinWallet();
    const bitcoinWallet = new BitcoinWallet(root);
    setCachedAddress('bitcoin', root.publicKey, bitcoinWallet.address);

    const { MoneroWallet } = lazyLoadMoneroWallet();
    const moneroWallet = new MoneroWallet(root);
    setCachedAddress('monero', root.publicKey, moneroWallet.address);

    const { EthereumWallet } = lazyLoadEthereumWallet();
    const ethereumWallet = new EthereumWallet(root);
    setCachedAddress('ethereum', root.publicKey, ethereumWallet.address);

    const { RavencoinWallet } = lazyLoadRavencoinWallet();
    const ravencoinWallet = new RavencoinWallet(root);
    setCachedAddress('ravencoin', root.publicKey, ravencoinWallet.address);

    const { ErgoWallet } = lazyLoadErgoWallet();
    const ergoWallet = new ErgoWallet(root);
    setCachedAddress('ergo', root.publicKey, ergoWallet.address);

    const { ConfluxWallet } = lazyLoadConfluxWallet();
    const confluxWallet = new ConfluxWallet(root);
    setCachedAddress('conflux', root.publicKey, confluxWallet.address);

    const { BitcoingoldWallet } = lazyLoadBitcoingoldWallet();
    const bitcoingoldWallet = new BitcoingoldWallet(root);
    setCachedAddress('bitcoingold', root.publicKey, bitcoingoldWallet.address);

    const { BeamWallet } = lazyLoadBeamWallet();
    const beamWallet = new BeamWallet(root);
    setCachedAddress('beam', root.publicKey, beamWallet.address);

    const { ZcashWallet } = lazyLoadZcashWallet();
    const zcashWallet = new ZcashWallet(root);
    setCachedAddress('zcash', root.publicKey, zcashWallet.address);

    const { AeternityWallet } = lazyLoadAeternityWallet();
    const aeternityWallet = new AeternityWallet(root);
    setCachedAddress('aeternity', root.publicKey, aeternityWallet.address);

    const { BitcoininterestWallet } = lazyLoadBitcoininterestWallet();
    const bitcoininterestWallet = new BitcoininterestWallet(root);
    setCachedAddress('bitcoininterest', root.publicKey, bitcoininterestWallet.address);

    const { ConcealWallet } = lazyLoadConcealWallet();
    const concealWallet = new ConcealWallet(root);
    setCachedAddress('conceal', root.publicKey, concealWallet.address);

    const { ZelcashWallet } = lazyLoadZelcashWallet();
    const zelcashWallet = new ZelcashWallet(root);
    setCachedAddress('zelcash', root.publicKey, zelcashWallet.address);

    const { GrinWallet } = lazyLoadGrinWallet();
    const grinWallet = new GrinWallet(root);
    setCachedAddress('grin', root.publicKey, grinWallet.address);

    const { VertcoinWallet } = lazyLoadVertcoinWallet();
    const vertcoinWallet = new VertcoinWallet(root);
    setCachedAddress('vertcoin', root.publicKey, vertcoinWallet.address);

    const { PeercoinWallet } = lazyLoadPeercoinWallet();
    const peercoinWallet = new PeercoinWallet(root);
    setCachedAddress('peercoin', root.publicKey, peercoinWallet.address);

    const { DigibyteWallet } = lazyLoadDigibyteWallet();
    const digibyteWallet = new DigibyteWallet(root);
    setCachedAddress('digibyte', root.publicKey, digibyteWallet.address);

    const { SyscoinWallet } = lazyLoadSyscoinWallet();
    const syscoinWallet = new SyscoinWallet(root);
    setCachedAddress('syscoin', root.publicKey, syscoinWallet.address);

    const { FluxWallet } = lazyLoadFluxWallet();
    const fluxWallet = new FluxWallet(root);
    setCachedAddress('flux', root.publicKey, fluxWallet.address);

    const { KomodoWallet } = lazyLoadKomodoWallet();
    const komodoWallet = new KomodoWallet(root);
    setCachedAddress('komodo', root.publicKey, komodoWallet.address);

    const { AionWallet } = lazyLoadAionWallet();
    const aionWallet = new AionWallet(root);
    setCachedAddress('aion', root.publicKey, aionWallet.address);

    const { CortexWallet } = lazyLoadCortexWallet();
    const cortexWallet = new CortexWallet(root);
    setCachedAddress('cortex', root.publicKey, cortexWallet.address);

    const { CallistoWallet } = lazyLoadCallistoWallet();
    const callistoWallet = new CallistoWallet(root);
    setCachedAddress('callisto', root.publicKey, callistoWallet.address);

    const { EllaismWallet } = lazyLoadEllaismWallet();
    const ellaismWallet = new EllaismWallet(root);
    setCachedAddress('ellaism', root.publicKey, ellaismWallet.address);

    const { ExpanseWallet } = lazyLoadExpanseWallet();
    const expanseWallet = new ExpanseWallet(root);
    setCachedAddress('expanse', root.publicKey, expanseWallet.address);

    const { MusicoinWallet } = lazyLoadMusicoinWallet();
    const musicoinWallet = new MusicoinWallet(root);
    setCachedAddress('musicoin', root.publicKey, musicoinWallet.address);

    const { PirlWallet } = lazyLoadPirlWallet();
    const pirlWallet = new PirlWallet(root);
    setCachedAddress('pirl', root.publicKey, pirlWallet.address);

    const { YocoinWallet } = lazyLoadYocoinWallet();
    const yocoinWallet = new YocoinWallet(root);
    setCachedAddress('yocoin', root.publicKey, yocoinWallet.address);

    const { ZoinWallet } = lazyLoadZoinWallet();
    const zoinWallet = new ZoinWallet(root);
    setCachedAddress('zoin', root.publicKey, zoinWallet.address);

    const { ZeroWallet } = lazyLoadZeroWallet();
    const zeroWallet = new ZeroWallet(root);
    setCachedAddress('zero', root.publicKey, zeroWallet.address);

    const { VidulumWallet } = lazyLoadVidulumWallet();
    const vidulumWallet = new VidulumWallet(root);
    setCachedAddress('vidulum', root.publicKey, vidulumWallet.address);

    const { SwapWallet } = lazyLoadSwapWallet();
    const swapWallet = new SwapWallet(root);
    setCachedAddress('swap', root.publicKey, swapWallet.address);

    const { GentariumWallet } = lazyLoadGentariumWallet();
    const gentariumWallet = new GentariumWallet(root);
    setCachedAddress('gentarium', root.publicKey, gentariumWallet.address);

    const { BitcoreWallet } = lazyLoadBitcoreWallet();
    const bitcoreWallet = new BitcoreWallet(root);
    setCachedAddress('bitcore', root.publicKey, bitcoreWallet.address);

    const { TrezarcoinWallet } = lazyLoadTrezarcoinWallet();
    const trezarcoinWallet = new TrezarcoinWallet(root);
    setCachedAddress('trezarcoin', root.publicKey, trezarcoinWallet.address);

    const { HempcoinWallet } = lazyLoadHempcoinWallet();
    const hempcoinWallet = new HempcoinWallet(root);
    setCachedAddress('hempcoin', root.publicKey, hempcoinWallet.address);

    const { GlobalboostWallet } = lazyLoadGlobalboostWallet();
    const globalboostWallet = new GlobalboostWallet(root);
    setCachedAddress('globalboost', root.publicKey, globalboostWallet.address);

    const { UbiqWallet } = lazyLoadUbiqWallet();
    const ubiqWallet = new UbiqWallet(root);
    setCachedAddress('ubiq', root.publicKey, ubiqWallet.address);

    const { EthergemWallet } = lazyLoadEthergemWallet();
    const ethergemWallet = new EthergemWallet(root);
    setCachedAddress('ethergem', root.publicKey, ethergemWallet.address);

    const { EtherSocialWallet } = lazyLoadEtherSocialWallet();
    const ethersocialWallet = new EtherSocialWallet(root);
    setCachedAddress('ethersocial', root.publicKey, ethersocialWallet.address);

    const { AkromaWallet } = lazyLoadAkromaWallet();
    const akromaWallet = new AkromaWallet(root);
    setCachedAddress('akroma', root.publicKey, akromaWallet.address);

    const { AtheiosWallet } = lazyLoadAtheiosWallet();
    const atheiosWallet = new AtheiosWallet(root);
    setCachedAddress('atheios', root.publicKey, atheiosWallet.address);

    const { MetaverseWallet } = lazyLoadMetaverseWallet();
    const metaverseWallet = new MetaverseWallet(root);
    setCachedAddress('metaverse', root.publicKey, metaverseWallet.address);

    const { QuarkChainWallet } = lazyLoadQuarkChainWallet();
    const quarkchainWallet = new QuarkChainWallet(root);
    setCachedAddress('quarkchain', root.publicKey, quarkchainWallet.address);

    const { EnergiWallet } = lazyLoadEnergiWallet();
    const energiWallet = new EnergiWallet(root);
    setCachedAddress('energi', root.publicKey, energiWallet.address);

    const { ThunderCoreWallet } = lazyLoadThunderCoreWallet();
    const thundercoreWallet = new ThunderCoreWallet(root);
    setCachedAddress('thundercore', root.publicKey, thundercoreWallet.address);

    const { GoChainWallet } = lazyLoadGoChainWallet();
    const gochainWallet = new GoChainWallet(root);
    setCachedAddress('gochain', root.publicKey, gochainWallet.address);

    const { Ether1Wallet } = lazyLoadEther1Wallet();
    const ether1Wallet = new Ether1Wallet(root);
    setCachedAddress('ether1', root.publicKey, ether1Wallet.address);

    const { MixWallet } = lazyLoadMixWallet();
    const mixWallet = new MixWallet(root);
    setCachedAddress('mix', root.publicKey, mixWallet.address);

    const { IxianWallet } = lazyLoadIxianWallet();
    const ixianWallet = new IxianWallet(root);
    setCachedAddress('ixian', root.publicKey, ixianWallet.address);

    const { BolivarcoinWallet } = lazyLoadBolivarcoinWallet();
    const bolivarcoinWallet = new BolivarcoinWallet(root);
    setCachedAddress('bolivarcoin', root.publicKey, bolivarcoinWallet.address);

    const { PigeoncoinWallet } = lazyLoadPigeoncoinWallet();
    const pigeoncoinWallet = new PigeoncoinWallet(root);
    setCachedAddress('pigeoncoin', root.publicKey, pigeoncoinWallet.address);

    const { RapidsWallet } = lazyLoadRapidsWallet();
    const rapidsWallet = new RapidsWallet(root);
    setCachedAddress('rapids', root.publicKey, rapidsWallet.address);

    const { SuqaWallet } = lazyLoadSuqaWallet();
    const suqaWallet = new SuqaWallet(root);
    setCachedAddress('suqa', root.publicKey, suqaWallet.address);

    const { ArgoneumWallet } = lazyLoadArgoneumWallet();
    const argoneumWallet = new ArgoneumWallet(root);
    setCachedAddress('argoneum', root.publicKey, argoneumWallet.address);

    const { SocialSendWallet } = lazyLoadSocialSendWallet();
    const socialsendWallet = new SocialSendWallet(root);
    setCachedAddress('socialsend', root.publicKey, socialsendWallet.address);

    const { PhoreWallet } = lazyLoadPhoreWallet();
    const phoreWallet = new PhoreWallet(root);
    setCachedAddress('phore', root.publicKey, phoreWallet.address);

    const { StipendWallet } = lazyLoadStipendWallet();
    const stipendWallet = new StipendWallet(root);
    setCachedAddress('stipend', root.publicKey, stipendWallet.address);

    const { ViacoinWallet } = lazyLoadViacoinWallet();
    const viacoinWallet = new ViacoinWallet(root);
    setCachedAddress('viacoin', root.publicKey, viacoinWallet.address);

    const { RaptoreumWallet } = lazyLoadRaptoreumWallet();
    const raptoreumWallet = new RaptoreumWallet(root);
    setCachedAddress('raptoreum', root.publicKey, raptoreumWallet.address);

    const wallet = {
      id: crypto.randomUUID(),
      mnemonic: password ? 'encrypted' : mnemonic,
      bitcoin: {
        address: bitcoinWallet.address,
        privateKey: bitcoinWallet.privateKey
      },
      monero: {
        address: moneroWallet.address,
        privateKey: moneroWallet.privateKey
      },
      ethereum: {
        address: ethereumWallet.address,
        privateKey: ethereumWallet.privateKey
      },
      ravencoin: {
        address: ravencoinWallet.address,
        privateKey: ravencoinWallet.privateKey
      },
      ergo: {
        address: ergoWallet.address,
        privateKey: ergoWallet.privateKey
      },
      ergo: {
        address: ergoWallet.address,
        privateKey: ergoWallet.privateKey
      },
      conflux: {
        address: confluxWallet.address,
        privateKey: confluxWallet.privateKey
      },
      bitcoingold: {
        address: bitcoingoldWallet.address,
        privateKey: bitcoingoldWallet.privateKey
      },
      beam: {
        address: beamWallet.address,
        privateKey: beamWallet.privateKey
      },
      zcash: {
        address: zcashWallet.address,
        privateKey: zcashWallet.privateKey
      },
      aeternity: {
        address: aeternityWallet.address,
        privateKey: aeternityWallet.privateKey
      },
      bitcoininterest: {
        address: bitcoininterestWallet.address,
        privateKey: bitcoininterestWallet.privateKey
      },
      conceal: {
        address: concealWallet.address,
        privateKey: concealWallet.privateKey
      },
      zelcash: {
        address: zelcashWallet.address,
        privateKey: zelcashWallet.privateKey
      },
      grin: {
        address: grinWallet.address,
        privateKey: grinWallet.privateKey
      },
      vertcoin: {
        address: vertcoinWallet.address,
        privateKey: vertcoinWallet.privateKey
      },
      peercoin: {
        address: peercoinWallet.address,
        privateKey: peercoinWallet.privateKey
      },
      digibyte: {
        address: digibyteWallet.address,
        privateKey: digibyteWallet.privateKey
      },
      syscoin: {
        address: syscoinWallet.address,
        privateKey: syscoinWallet.privateKey
      },
      flux: {
        address: fluxWallet.address,
        privateKey: fluxWallet.privateKey
      },
      komodo: {
        address: komodoWallet.address,
        privateKey: komodoWallet.privateKey
      },
      aion: {
        address: aionWallet.address,
        privateKey: aionWallet.privateKey
      },
      cortex: {
        address: cortexWallet.address,
        privateKey: cortexWallet.privateKey
      },
      callisto: {
        address: callistoWallet.address,
        privateKey: callistoWallet.privateKey
      },
      ellaism: {
        address: ellaismWallet.address,
        privateKey: ellaismWallet.privateKey
      },
      expanse: {
        address: expanseWallet.address,
        privateKey: expanseWallet.privateKey
      },
      musicoin: {
        address: musicoinWallet.address,
        privateKey: musicoinWallet.privateKey
      },
      pirl: {
        address: pirlWallet.address,
        privateKey: pirlWallet.privateKey
      },
      yocoin: {
        address: yocoinWallet.address,
        privateKey: yocoinWallet.privateKey
      },
      zoin: {
        address: zoinWallet.address,
        privateKey: zoinWallet.privateKey
      },
      zero: {
        address: zeroWallet.address,
        privateKey: zeroWallet.privateKey
      },
      vidulum: {
        address: vidulumWallet.address,
        privateKey: vidulumWallet.privateKey
      },
      swap: {
        address: swapWallet.address,
        privateKey: swapWallet.privateKey
      },
      gentarium: {
        address: gentariumWallet.address,
        privateKey: gentariumWallet.privateKey
      },
      bitcore: {
        address: bitcoreWallet.address,
        privateKey: bitcoreWallet.privateKey
      },
      trezarcoin: {
        address: trezarcoinWallet.address,
        privateKey: trezarcoinWallet.privateKey
      },
      hempcoin: {
        address: hempcoinWallet.address,
        privateKey: hempcoinWallet.privateKey
      },
      globalboost: {
        address: globalboostWallet.address,
        privateKey: globalboostWallet.privateKey
      },
      ubiq: {
        address: ubiqWallet.address,
        privateKey: ubiqWallet.privateKey
      },
      ethergem: {
        address: ethergemWallet.address,
        privateKey: ethergemWallet.privateKey
      },
      ethersocial: {
        address: ethersocialWallet.address,
        privateKey: ethersocialWallet.privateKey
      },
      akroma: {
        address: akromaWallet.address,
        privateKey: akromaWallet.privateKey
      },
      atheios: {
        address: atheiosWallet.address,
        privateKey: atheiosWallet.privateKey
      },
      metaverse: {
        address: metaverseWallet.address,
        privateKey: metaverseWallet.privateKey
      },
      quarkchain: {
        address: quarkchainWallet.address,
        privateKey: quarkchainWallet.privateKey
      },
      energi: {
        address: energiWallet.address,
        privateKey: energiWallet.privateKey
      },
      thundercore: {
        address: thundercoreWallet.address,
        privateKey: thundercoreWallet.privateKey
      },
      gochain: {
        address: gochainWallet.address,
        privateKey: gochainWallet.privateKey
      },
      ether1: {
        address: ether1Wallet.address,
        privateKey: ether1Wallet.privateKey
      },
      mix: {
        address: mixWallet.address,
        privateKey: mixWallet.privateKey
      },
      ixian: {
        address: ixianWallet.address,
        privateKey: ixianWallet.privateKey
      },
      bolivarcoin: {
        address: bolivarcoinWallet.address,
        privateKey: bolivarcoinWallet.privateKey
      },
      pigeoncoin: {
        address: pigeoncoinWallet.address,
        privateKey: pigeoncoinWallet.privateKey
      },
      rapids: {
        address: rapidsWallet.address,
        privateKey: rapidsWallet.privateKey
      },
      suqa: {
        address: suqaWallet.address,
        privateKey: suqaWallet.privateKey
      },
      argoneum: {
        address: argoneumWallet.address,
        privateKey: argoneumWallet.privateKey
      },
      socialsend: {
        address: socialsendWallet.address,
        privateKey: socialsendWallet.privateKey
      },
      phore: {
        address: phoreWallet.address,
        privateKey: phoreWallet.privateKey
      },
      stipend: {
        address: stipendWallet.address,
        privateKey: stipendWallet.privateKey
      },
      viacoin: {
        address: viacoinWallet.address,
        privateKey: viacoinWallet.privateKey
      },
      raptoreum: {
        address: raptoreumWallet.address,
        privateKey: raptoreumWallet.privateKey
      },
      createdAt: new Date()
    };

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Derive wallet from path
router.post('/derive-wallet', async (req, res) => {
  try {
    const { mnemonic, path, coin } = req.body;

    if (!bip39.validateMnemonic(mnemonic)) {
      return res.status(400).json({ error: 'Invalid mnemonic' });
    }

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const child = deriveHdKey(seed, path);

    let wallet, walletType;
    if (coin === 'bitcoin') {
      const { BitcoinWallet } = lazyLoadBitcoinWallet();
      wallet = new BitcoinWallet(child);
      walletType = 'bitcoin';
    } else if (coin === 'monero') {
      const { MoneroWallet } = lazyLoadMoneroWallet();
      wallet = new MoneroWallet(child);
      walletType = 'monero';
    } else if (coin === 'ethereum') {
      const { EthereumWallet } = lazyLoadEthereumWallet();
      wallet = new EthereumWallet(child);
      walletType = 'ethereum';
    } else if (coin === 'ravencoin') {
      const { RavencoinWallet } = lazyLoadRavencoinWallet();
      wallet = new RavencoinWallet(child);
      walletType = 'ravencoin';
    } else if (coin === 'ergo') {
      const { ErgoWallet } = lazyLoadErgoWallet();
      wallet = new ErgoWallet(child);
      walletType = 'ergo';
    } else if (coin === 'conflux') {
      const { ConfluxWallet } = lazyLoadConfluxWallet();
      wallet = new ConfluxWallet(child);
      walletType = 'conflux';
    } else if (coin === 'bitcoingold') {
      const { BitcoingoldWallet } = lazyLoadBitcoingoldWallet();
      wallet = new BitcoingoldWallet(child);
      walletType = 'bitcoingold';
    } else if (coin === 'beam') {
      const { BeamWallet } = lazyLoadBeamWallet();
      wallet = new BeamWallet(child);
      walletType = 'beam';
    } else if (coin === 'zcash') {
      const { ZcashWallet } = lazyLoadZcashWallet();
      wallet = new ZcashWallet(child);
      walletType = 'zcash';
    } else if (coin === 'aeternity') {
      const { AeternityWallet } = lazyLoadAeternityWallet();
      wallet = new AeternityWallet(child);
      walletType = 'aeternity';
    } else if (coin === 'bitcoininterest') {
      const { BitcoininterestWallet } = lazyLoadBitcoininterestWallet();
      wallet = new BitcoininterestWallet(child);
      walletType = 'bitcoininterest';
    } else if (coin === 'conceal') {
      const { ConcealWallet } = lazyLoadConcealWallet();
      wallet = new ConcealWallet(child);
      walletType = 'conceal';
    } else if (coin === 'zelcash') {
      const { ZelcashWallet } = lazyLoadZelcashWallet();
      wallet = new ZelcashWallet(child);
      walletType = 'zelcash';
    } else if (coin === 'grin') {
      const { GrinWallet } = lazyLoadGrinWallet();
      wallet = new GrinWallet(child);
      walletType = 'grin';
    } else if (coin === 'vertcoin') {
      const { VertcoinWallet } = lazyLoadVertcoinWallet();
      wallet = new VertcoinWallet(child);
      walletType = 'vertcoin';
    } else if (coin === 'peercoin') {
      const { PeercoinWallet } = lazyLoadPeercoinWallet();
      wallet = new PeercoinWallet(child);
      walletType = 'peercoin';
    } else if (coin === 'digibyte') {
      const { DigibyteWallet } = lazyLoadDigibyteWallet();
      wallet = new DigibyteWallet(child);
      walletType = 'digibyte';
    } else if (coin === 'syscoin') {
      const { SyscoinWallet } = lazyLoadSyscoinWallet();
      wallet = new SyscoinWallet(child);
      walletType = 'syscoin';
    } else if (coin === 'flux') {
      const { FluxWallet } = lazyLoadFluxWallet();
      wallet = new FluxWallet(child);
      walletType = 'flux';
    } else if (coin === 'komodo') {
      const { KomodoWallet } = lazyLoadKomodoWallet();
      wallet = new KomodoWallet(child);
      walletType = 'komodo';
    } else if (coin === 'aion') {
      const { AionWallet } = lazyLoadAionWallet();
      wallet = new AionWallet(child);
      walletType = 'aion';
    } else if (coin === 'cortex') {
      const { CortexWallet } = lazyLoadCortexWallet();
      wallet = new CortexWallet(child);
      walletType = 'cortex';
    } else if (coin === 'callisto') {
      const { CallistoWallet } = lazyLoadCallistoWallet();
      wallet = new CallistoWallet(child);
      walletType = 'callisto';
    } else if (coin === 'ellaism') {
      const { EllaismWallet } = lazyLoadEllaismWallet();
      wallet = new EllaismWallet(child);
      walletType = 'ellaism';
    } else if (coin === 'expanse') {
      const { ExpanseWallet } = lazyLoadExpanseWallet();
      wallet = new ExpanseWallet(child);
      walletType = 'expanse';
    } else if (coin === 'musicoin') {
      const { MusicoinWallet } = lazyLoadMusicoinWallet();
      wallet = new MusicoinWallet(child);
      walletType = 'musicoin';
    } else if (coin === 'pirl') {
      const { PirlWallet } = lazyLoadPirlWallet();
      wallet = new PirlWallet(child);
      walletType = 'pirl';
    } else if (coin === 'yocoin') {
      const { YocoinWallet } = lazyLoadYocoinWallet();
      wallet = new YocoinWallet(child);
      walletType = 'yocoin';
    } else if (coin === 'zoin') {
      const { ZoinWallet } = lazyLoadZoinWallet();
      wallet = new ZoinWallet(child);
      walletType = 'zoin';
    } else if (coin === 'zero') {
      const { ZeroWallet } = lazyLoadZeroWallet();
      wallet = new ZeroWallet(child);
      walletType = 'zero';
    } else if (coin === 'vidulum') {
      const { VidulumWallet } = lazyLoadVidulumWallet();
      wallet = new VidulumWallet(child);
      walletType = 'vidulum';
    } else if (coin === 'swap') {
      const { SwapWallet } = lazyLoadSwapWallet();
      wallet = new SwapWallet(child);
      walletType = 'swap';
    } else if (coin === 'gentarium') {
      const { GentariumWallet } = lazyLoadGentariumWallet();
      wallet = new GentariumWallet(child);
      walletType = 'gentarium';
    } else if (coin === 'bitcore') {
      const { BitcoreWallet } = lazyLoadBitcoreWallet();
      wallet = new BitcoreWallet(child);
      walletType = 'bitcore';
    } else if (coin === 'trezarcoin') {
      const { TrezarcoinWallet } = lazyLoadTrezarcoinWallet();
      wallet = new TrezarcoinWallet(child);
      walletType = 'trezarcoin';
    } else if (coin === 'hempcoin') {
      const { HempcoinWallet } = lazyLoadHempcoinWallet();
      wallet = new HempcoinWallet(child);
      walletType = 'hempcoin';
    } else if (coin === 'globalboost') {
      const { GlobalboostWallet } = lazyLoadGlobalboostWallet();
      wallet = new GlobalboostWallet(child);
      walletType = 'globalboost';
    } else if (coin === 'ubiq') {
      const { UbiqWallet } = lazyLoadUbiqWallet();
      wallet = new UbiqWallet(child);
      walletType = 'ubiq';
    } else if (coin === 'ethergem') {
      const { EthergemWallet } = lazyLoadEthergemWallet();
      wallet = new EthergemWallet(child);
      walletType = 'ethergem';
    } else if (coin === 'ethersocial') {
      const { EtherSocialWallet } = lazyLoadEtherSocialWallet();
      wallet = new EtherSocialWallet(child);
      walletType = 'ethersocial';
    } else if (coin === 'akroma') {
      const { AkromaWallet } = lazyLoadAkromaWallet();
      wallet = new AkromaWallet(child);
      walletType = 'akroma';
    } else if (coin === 'atheios') {
      const { AtheiosWallet } = lazyLoadAtheiosWallet();
      wallet = new AtheiosWallet(child);
      walletType = 'atheios';
    } else if (coin === 'metaverse') {
      const { MetaverseWallet } = lazyLoadMetaverseWallet();
      wallet = new MetaverseWallet(child);
      walletType = 'metaverse';
    } else if (coin === 'quarkchain') {
      const { QuarkChainWallet } = lazyLoadQuarkChainWallet();
      wallet = new QuarkChainWallet(child);
      walletType = 'quarkchain';
    } else if (coin === 'energi') {
      const { EnergiWallet } = lazyLoadEnergiWallet();
      wallet = new EnergiWallet(child);
      walletType = 'energi';
    } else if (coin === 'thundercore') {
      const { ThunderCoreWallet } = lazyLoadThunderCoreWallet();
      wallet = new ThunderCoreWallet(child);
      walletType = 'thundercore';
    } else if (coin === 'gochain') {
      const { GoChainWallet } = lazyLoadGoChainWallet();
      wallet = new GoChainWallet(child);
      walletType = 'gochain';
    } else if (coin === 'ether1') {
      const { Ether1Wallet } = lazyLoadEther1Wallet();
      wallet = new Ether1Wallet(child);
      walletType = 'ether1';
    } else if (coin === 'mix') {
      const { MixWallet } = lazyLoadMixWallet();
      wallet = new MixWallet(child);
      walletType = 'mix';
    } else if (coin === 'ixian') {
      const { IxianWallet } = lazyLoadIxianWallet();
      wallet = new IxianWallet(child);
      walletType = 'ixian';
    } else if (coin === 'bolivarcoin') {
      const { BolivarcoinWallet } = lazyLoadBolivarcoinWallet();
      wallet = new BolivarcoinWallet(child);
      walletType = 'bolivarcoin';
    } else if (coin === 'pigeoncoin') {
      const { PigeoncoinWallet } = lazyLoadPigeoncoinWallet();
      wallet = new PigeoncoinWallet(child);
      walletType = 'pigeoncoin';
    } else if (coin === 'rapids') {
      const { RapidsWallet } = lazyLoadRapidsWallet();
      wallet = new RapidsWallet(child);
      walletType = 'rapids';
    } else if (coin === 'suqa') {
      const { SuqaWallet } = lazyLoadSuqaWallet();
      wallet = new SuqaWallet(child);
      walletType = 'suqa';
    } else if (coin === 'argoneum') {
      const { ArgoneumWallet } = lazyLoadArgoneumWallet();
      wallet = new ArgoneumWallet(child);
      walletType = 'argoneum';
    } else if (coin === 'socialsend') {
      const { SocialSendWallet } = lazyLoadSocialSendWallet();
      wallet = new SocialSendWallet(child);
      walletType = 'socialsend';
    } else if (coin === 'phore') {
      const { PhoreWallet } = lazyLoadPhoreWallet();
      wallet = new PhoreWallet(child);
      walletType = 'phore';
    } else if (coin === 'stipend') {
      const { StipendWallet } = lazyLoadStipendWallet();
      wallet = new StipendWallet(child);
      walletType = 'stipend';
    } else if (coin === 'viacoin') {
      const { ViacoinWallet } = lazyLoadViacoinWallet();
      wallet = new ViacoinWallet(child);
      walletType = 'viacoin';
    } else if (coin === 'raptoreum') {
      const { RaptoreumWallet } = lazyLoadRaptoreumWallet();
      wallet = new RaptoreumWallet(child);
      walletType = 'raptoreum';
    } else {
      return res.status(400).json({ error: 'Unsupported coin type' });
    }

    // Cache the derived address
    setCachedAddress(walletType, child.publicKey, wallet.address);

    res.json({
      path,
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount transaction routes
router.use('/transaction', transactionRouter);

module.exports = router;
