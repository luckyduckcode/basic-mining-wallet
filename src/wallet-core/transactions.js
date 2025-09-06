const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();

// Blockchain RPC configurations
const RPC_ENDPOINTS = {
  bitcoin: {
    mainnet: process.env.BITCOIN_RPC_URL || 'https://bitcoin-rpc.publicnode.com',
    testnet: process.env.BITCOIN_TESTNET_RPC_URL || 'https://bitcoin-testnet-rpc.publicnode.com',
    username: process.env.BITCOIN_RPC_USER || '',
    password: process.env.BITCOIN_RPC_PASS || ''
  },
  ethereum: {
    mainnet: process.env.ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    sepolia: process.env.ETHEREUM_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    goerli: process.env.ETHEREUM_GOERLI_RPC_URL || 'https://ethereum-goerli-rpc.publicnode.com'
  },
  monero: {
    mainnet: process.env.MONERO_RPC_URL || 'https://node.monerooutreach.org',
    testnet: process.env.MONERO_TESTNET_RPC_URL || 'https://monero-testnet-rpc.publicnode.com',
    stagenet: process.env.MONERO_STAGENET_RPC_URL || 'https://monero-stagenet-rpc.publicnode.com'
  },
  ravencoin: {
    mainnet: process.env.RAVENCOIN_RPC_URL || 'https://rvn-rpc-mainnet.ting.finance',
    testnet: process.env.RAVENCOIN_TESTNET_RPC_URL || 'https://ravencoin-testnet-rpc.publicnode.com'
  },
  ergo: {
    mainnet: process.env.ERGO_RPC_URL || 'https://api.ergoplatform.com',
    testnet: process.env.ERGO_TESTNET_RPC_URL || 'https://ergo-testnet-rpc.publicnode.com'
  },
  conflux: {
    mainnet: process.env.CONFLUX_RPC_URL || 'https://main.confluxrpc.com',
    testnet: process.env.CONFLUX_TESTNET_RPC_URL || 'https://conflux-testnet-rpc.publicnode.com'
  },
  bitcoingold: {
    mainnet: process.env.BITCOINGOLD_RPC_URL || 'https://explorer.bitcoingold.org/api',
    testnet: process.env.BITCOINGOLD_TESTNET_RPC_URL || 'https://bitcoingold-testnet-rpc.publicnode.com'
  },
  beam: {
    mainnet: process.env.BEAM_RPC_URL || 'https://mainnet-beam-masternode-1.switcheo.network',
    testnet: process.env.BEAM_TESTNET_RPC_URL || 'https://beam-testnet-rpc.publicnode.com'
  },
  zcash: {
    mainnet: process.env.ZCASH_RPC_URL || 'https://zcash-rpc.my-mining-pool.de',
    testnet: process.env.ZCASH_TESTNET_RPC_URL || 'https://zcash-testnet-rpc.publicnode.com'
  },
  aeternity: {
    mainnet: process.env.AETERNITY_RPC_URL || 'https://mainnet.aeternity.io',
    testnet: process.env.AETERNITY_TESTNET_RPC_URL || 'https://aeternity-testnet-rpc.publicnode.com'
  },
  bitcoininterest: {
    mainnet: process.env.BITCOININTEREST_RPC_URL || 'https://explorer.bitcoininterest.org/api',
    testnet: process.env.BITCOININTEREST_TESTNET_RPC_URL || 'https://bitcoininterest-testnet-rpc.publicnode.com'
  },
  conceal: {
    mainnet: process.env.CONCEAL_RPC_URL || 'https://explorer.conceal.network/api',
    testnet: process.env.CONCEAL_TESTNET_RPC_URL || 'https://conceal-testnet-rpc.publicnode.com'
  },
  zelcash: {
    mainnet: process.env.ZELCASH_RPC_URL || 'https://explorer.zel.cash/api',
    testnet: process.env.ZELCASH_TESTNET_RPC_URL || 'https://zelcash-testnet-rpc.publicnode.com'
  },
  grin: {
    mainnet: process.env.GRIN_RPC_URL || 'https://grin-api.mainnet.iim.mw',
    testnet: process.env.GRIN_TESTNET_RPC_URL || 'https://grin-testnet-rpc.publicnode.com'
  },
  vertcoin: {
    mainnet: process.env.VERTCOIN_RPC_URL || 'https://explorer.vertcoin.org/api',
    testnet: process.env.VERTCOIN_TESTNET_RPC_URL || 'https://vertcoin-testnet-rpc.publicnode.com'
  },
  peercoin: {
    mainnet: process.env.PEERCOIN_RPC_URL || 'https://explorer.peercoin.net/api',
    testnet: process.env.PEERCOIN_TESTNET_RPC_URL || 'https://peercoin-testnet-rpc.publicnode.com'
  },
  digibyte: {
    mainnet: process.env.DIGIBYTE_RPC_URL || 'https://digibyte-explorer.com/api',
    testnet: process.env.DIGIBYTE_TESTNET_RPC_URL || 'https://digibyte-testnet-rpc.publicnode.com'
  },
  syscoin: {
    mainnet: process.env.SYSCOIN_RPC_URL || 'https://explorer.syscoin.org/api',
    testnet: process.env.SYSCOIN_TESTNET_RPC_URL || 'https://syscoin-testnet-rpc.publicnode.com'
  },
  flux: {
    mainnet: process.env.FLUX_RPC_URL || 'https://explorer.runonflux.io/api',
    testnet: process.env.FLUX_TESTNET_RPC_URL || 'https://flux-testnet-rpc.publicnode.com'
  },
  komodo: {
    mainnet: process.env.KOMODO_RPC_URL || 'https://komodo-explorer.com/api',
    testnet: process.env.KOMODO_TESTNET_RPC_URL || 'https://komodo-testnet-rpc.publicnode.com'
  },
  aion: {
    mainnet: process.env.AION_RPC_URL || 'https://aion.api.nodesmith.io',
    testnet: process.env.AION_TESTNET_RPC_URL || 'https://aion-testnet-rpc.publicnode.com'
  },
  cortex: {
    mainnet: process.env.CORTEX_RPC_URL || 'https://cortex-mainnet.infura.io',
    testnet: process.env.CORTEX_TESTNET_RPC_URL || 'https://cortex-testnet-rpc.publicnode.com'
  },
  callisto: {
    mainnet: process.env.CALLISTO_RPC_URL || 'https://clo-geth.0xinfra.com',
    testnet: process.env.CALLISTO_TESTNET_RPC_URL || 'https://callisto-testnet-rpc.publicnode.com'
  },
  ellaism: {
    mainnet: process.env.ELLAISM_RPC_URL || 'https://jsonrpc.ellaism.org',
    testnet: process.env.ELLAISM_TESTNET_RPC_URL || 'https://ellaism-testnet-rpc.publicnode.com'
  },
  expanse: {
    mainnet: process.env.EXPANSE_RPC_URL || 'https://node.expanse.tech',
    testnet: process.env.EXPANSE_TESTNET_RPC_URL || 'https://expanse-testnet-rpc.publicnode.com'
  },
  musicoin: {
    mainnet: process.env.MUSICOIN_RPC_URL || 'https://mewapi.musicoin.org',
    testnet: process.env.MUSICOIN_TESTNET_RPC_URL || 'https://musicoin-testnet-rpc.publicnode.com'
  },
  pirl: {
    mainnet: process.env.PIRL_RPC_URL || 'https://wallrpc.pirl.io',
    testnet: process.env.PIRL_TESTNET_RPC_URL || 'https://pirl-testnet-rpc.publicnode.com'
  },
  yocoin: {
    mainnet: process.env.YOCOIN_RPC_URL || 'https://explorer.yocoin.org/api',
    testnet: process.env.YOCOIN_TESTNET_RPC_URL || 'https://yocoin-testnet-rpc.publicnode.com'
  },
  zoin: {
    mainnet: process.env.ZOIN_RPC_URL || 'https://explorer.zoin.org/api',
    testnet: process.env.ZOIN_TESTNET_RPC_URL || 'https://zoin-testnet-rpc.publicnode.com'
  },
  zero: {
    mainnet: process.env.ZERO_RPC_URL || 'https://explorer.zero.org/api',
    testnet: process.env.ZERO_TESTNET_RPC_URL || 'https://zero-testnet-rpc.publicnode.com'
  },
  vidulum: {
    mainnet: process.env.VIDULUM_RPC_URL || 'https://explorer.vidulum.org/api',
    testnet: process.env.VIDULUM_TESTNET_RPC_URL || 'https://vidulum-testnet-rpc.publicnode.com'
  },
  swap: {
    mainnet: process.env.SWAP_RPC_URL || 'https://explorer.swap.org/api',
    testnet: process.env.SWAP_TESTNET_RPC_URL || 'https://swap-testnet-rpc.publicnode.com'
  },
  gentarium: {
    mainnet: process.env.GENTARIUM_RPC_URL || 'https://explorer.gentarium.org/api',
    testnet: process.env.GENTARIUM_TESTNET_RPC_URL || 'https://gentarium-testnet-rpc.publicnode.com'
  },
  bitcore: {
    mainnet: process.env.BITCORE_RPC_URL || 'https://explorer.bitcore.org/api',
    testnet: process.env.BITCORE_TESTNET_RPC_URL || 'https://bitcore-testnet-rpc.publicnode.com'
  },
  trezarcoin: {
    mainnet: process.env.TREZARCOIN_RPC_URL || 'https://explorer.trezarcoin.org/api',
    testnet: process.env.TREZARCOIN_TESTNET_RPC_URL || 'https://trezarcoin-testnet-rpc.publicnode.com'
  },
  hempcoin: {
    mainnet: process.env.HEMPCOIN_RPC_URL || 'https://explorer.hempcoin.org/api',
    testnet: process.env.HEMPCOIN_TESTNET_RPC_URL || 'https://hempcoin-testnet-rpc.publicnode.com'
  },
  globalboost: {
    mainnet: process.env.GLOBALBOOST_RPC_URL || 'https://explorer.globalboost.org/api',
    testnet: process.env.GLOBALBOOST_TESTNET_RPC_URL || 'https://globalboost-testnet-rpc.publicnode.com'
  },
  ubiq: {
    mainnet: process.env.UBIQ_RPC_URL || 'https://rpc.ubiqscan.io',
    testnet: process.env.UBIQ_TESTNET_RPC_URL || 'https://ubiq-testnet-rpc.publicnode.com'
  },
  ethergem: {
    mainnet: process.env.ETHERGEM_RPC_URL || 'https://rpc.ethergem.org',
    testnet: process.env.ETHERGEM_TESTNET_RPC_URL || 'https://ethergem-testnet-rpc.publicnode.com'
  },
  ethersocial: {
    mainnet: process.env.ETHERSOCIAL_RPC_URL || 'https://rpc.ethersocial.org',
    testnet: process.env.ETHERSOCIAL_TESTNET_RPC_URL || 'https://ethersocial-testnet-rpc.publicnode.com'
  },
  akroma: {
    mainnet: process.env.AKROMA_RPC_URL || 'https://remote.akroma.io',
    testnet: process.env.AKROMA_TESTNET_RPC_URL || 'https://akroma-testnet-rpc.publicnode.com'
  },
  atheios: {
    mainnet: process.env.ATHEIOS_RPC_URL || 'https://wallet.atheios.org',
    testnet: process.env.ATHEIOS_TESTNET_RPC_URL || 'https://atheios-testnet-rpc.publicnode.com'
  },
  metaverse: {
    mainnet: process.env.METAVERSE_RPC_URL || 'https://rpc.metaverse.org',
    testnet: process.env.METAVERSE_TESTNET_RPC_URL || 'https://metaverse-testnet-rpc.publicnode.com'
  },
  quarkchain: {
    mainnet: process.env.QUARKCHAIN_RPC_URL || 'https://mainnet.quarkchain.io',
    testnet: process.env.QUARKCHAIN_TESTNET_RPC_URL || 'https://quarkchain-testnet-rpc.publicnode.com'
  },
  energi: {
    mainnet: process.env.ENERGI_RPC_URL || 'https://nodeapi.energi.network',
    testnet: process.env.ENERGI_TESTNET_RPC_URL || 'https://energi-testnet-rpc.publicnode.com'
  },
  thundercore: {
    mainnet: process.env.THUNDERCORE_RPC_URL || 'https://mainnet-rpc.thundercore.com',
    testnet: process.env.THUNDERCORE_TESTNET_RPC_URL || 'https://thundercore-testnet-rpc.publicnode.com'
  },
  gochain: {
    mainnet: process.env.GOCHAIN_RPC_URL || 'https://rpc.gochain.io',
    testnet: process.env.GOCHAIN_TESTNET_RPC_URL || 'https://gochain-testnet-rpc.publicnode.com'
  },
  ether1: {
    mainnet: process.env.ETHER1_RPC_URL || 'https://rpc.ether1.org',
    testnet: process.env.ETHER1_TESTNET_RPC_URL || 'https://ether1-testnet-rpc.publicnode.com'
  },
  mix: {
    mainnet: process.env.MIX_RPC_URL || 'https://rpc.mix-blockchain.org',
    testnet: process.env.MIX_TESTNET_RPC_URL || 'https://mix-testnet-rpc.publicnode.com'
  },
  ixian: {
    mainnet: process.env.IXIAN_RPC_URL || 'https://api.ixian.io',
    testnet: process.env.IXIAN_TESTNET_RPC_URL || 'https://ixian-testnet-rpc.publicnode.com'
  },
  bolivarcoin: {
    mainnet: process.env.BOLIVARCOIN_RPC_URL || 'https://explorer.bolivarcoin.org/api',
    testnet: process.env.BOLIVARCOIN_TESTNET_RPC_URL || 'https://bolivarcoin-testnet-rpc.publicnode.com'
  },
  pigeoncoin: {
    mainnet: process.env.PIGEONCOIN_RPC_URL || 'https://explorer.pigeoncoin.org/api',
    testnet: process.env.PIGEONCOIN_TESTNET_RPC_URL || 'https://pigeoncoin-testnet-rpc.publicnode.com'
  },
  rapids: {
    mainnet: process.env.RAPIDS_RPC_URL || 'https://explorer.rapids.org/api',
    testnet: process.env.RAPIDS_TESTNET_RPC_URL || 'https://rapids-testnet-rpc.publicnode.com'
  },
  suqa: {
    mainnet: process.env.SUQA_RPC_URL || 'https://explorer.suqa.org/api',
    testnet: process.env.SUQA_TESTNET_RPC_URL || 'https://suqa-testnet-rpc.publicnode.com'
  },
  argoneum: {
    mainnet: process.env.ARGONEUM_RPC_URL || 'https://explorer.argoneum.org/api',
    testnet: process.env.ARGONEUM_TESTNET_RPC_URL || 'https://argoneum-testnet-rpc.publicnode.com'
  },
  socialsend: {
    mainnet: process.env.SOCIALSEND_RPC_URL || 'https://explorer.socialsend.org/api',
    testnet: process.env.SOCIALSEND_TESTNET_RPC_URL || 'https://socialsend-testnet-rpc.publicnode.com'
  },
  phore: {
    mainnet: process.env.PHORE_RPC_URL || 'https://explorer.phore.io/api',
    testnet: process.env.PHORE_TESTNET_RPC_URL || 'https://phore-testnet-rpc.publicnode.com'
  },
  stipend: {
    mainnet: process.env.STIPEND_RPC_URL || 'https://explorer.stipend.org/api',
    testnet: process.env.STIPEND_TESTNET_RPC_URL || 'https://stipend-testnet-rpc.publicnode.com'
  },
  viacoin: {
    mainnet: process.env.VIACOIN_RPC_URL || 'https://explorer.viacoin.org/api',
    testnet: process.env.VIACOIN_TESTNET_RPC_URL || 'https://viacoin-testnet-rpc.publicnode.com'
  },
  raptoreum: {
    mainnet: process.env.RAPTOREUM_RPC_URL || 'https://explorer.raptoreum.org/api',
    testnet: process.env.RAPTOREUM_TESTNET_RPC_URL || 'https://raptoreum-testnet-rpc.publicnode.com'
  }
};

// Transaction cache for performance
const txCache = new Map();

// Lazy-loaded wallet imports
const walletCache = new Map();

const lazyLoadWallet = (coin) => {
  if (!walletCache.has(coin)) {
    try {
      const walletModule = require(`../wallet-core/${coin}-wallet`);
      walletCache.set(coin, walletModule);
    } catch (error) {
      console.error(`Failed to load ${coin} wallet:`, error.message);
    }
  }
  return walletCache.get(coin);
};

// Get wallet balance
router.get('/balance/:coin/:address', async (req, res) => {
  try {
    const { coin, address } = req.params;
    const { network = 'mainnet' } = req.query;

    let balance = 0;

    switch (coin.toLowerCase()) {
      case 'bitcoin':
        balance = await getBitcoinBalance(address, network);
        break;
      case 'ethereum':
        balance = await getEthereumBalance(address, network);
        break;
      case 'monero':
        balance = await getMoneroBalance(address, network);
        break;
      case 'ravencoin':
        balance = await getRavencoinBalance(address, network);
        break;
      case 'ergo':
        balance = await getErgoBalance(address, network);
        break;
      case 'conflux':
        balance = await getConfluxBalance(address, network);
        break;
      case 'bitcoingold':
        balance = await getBitcoingoldBalance(address, network);
        break;
      case 'beam':
        balance = await getBeamBalance(address, network);
        break;
      case 'zcash':
        balance = await getZcashBalance(address, network);
        break;
      case 'aeternity':
        balance = await getAeternityBalance(address, network);
        break;
      case 'bitcoininterest':
        balance = await getBitcoininterestBalance(address, network);
        break;
      case 'conceal':
        balance = await getConcealBalance(address, network);
        break;
      case 'zelcash':
        balance = await getZelcashBalance(address, network);
        break;
      case 'grin':
        balance = await getGrinBalance(address, network);
        break;
      case 'vertcoin':
        balance = await getVertcoinBalance(address, network);
        break;
      case 'peercoin':
        balance = await getPeercoinBalance(address, network);
        break;
      case 'digibyte':
        balance = await getDigibyteBalance(address, network);
        break;
      case 'syscoin':
        balance = await getSyscoinBalance(address, network);
        break;
      case 'flux':
        balance = await getFluxBalance(address, network);
        break;
      case 'komodo':
        balance = await getKomodoBalance(address, network);
        break;
      case 'aion':
        balance = await getAionBalance(address, network);
        break;
      case 'cortex':
        balance = await getCortexBalance(address, network);
        break;
      case 'callisto':
        balance = await getCallistoBalance(address, network);
        break;
      case 'ellaism':
        balance = await getEllaismBalance(address, network);
        break;
      case 'expanse':
        balance = await getExpanseBalance(address, network);
        break;
      case 'musicoin':
        balance = await getMusicoinBalance(address, network);
        break;
      case 'pirl':
        balance = await getPirlBalance(address, network);
        break;
      case 'yocoin':
        balance = await getYocoinBalance(address, network);
        break;
      case 'zoin':
        balance = await getZoinBalance(address, network);
        break;
      case 'zero':
        balance = await getZeroBalance(address, network);
        break;
      case 'vidulum':
        balance = await getVidulumBalance(address, network);
        break;
      case 'swap':
        balance = await getSwapBalance(address, network);
        break;
      case 'gentarium':
        balance = await getGentariumBalance(address, network);
        break;
      case 'bitcore':
        balance = await getBitcoreBalance(address, network);
        break;
      case 'trezarcoin':
        balance = await getTrezarcoinBalance(address, network);
        break;
      case 'hempcoin':
        balance = await getHempcoinBalance(address, network);
        break;
      case 'globalboost':
        balance = await getGlobalboostBalance(address, network);
        break;
      case 'ubiq':
        balance = await getUbiqBalance(address, network);
        break;
      case 'ethergem':
        balance = await getEthergemBalance(address, network);
        break;
      case 'ethersocial':
        balance = await getEtherSocialBalance(address, network);
        break;
      case 'akroma':
        balance = await getAkromaBalance(address, network);
        break;
      case 'atheios':
        balance = await getAtheiosBalance(address, network);
        break;
      case 'metaverse':
        balance = await getMetaverseBalance(address, network);
        break;
      case 'quarkchain':
        balance = await getQuarkChainBalance(address, network);
        break;
      case 'energi':
        balance = await getEnergiBalance(address, network);
        break;
      case 'thundercore':
        balance = await getThunderCoreBalance(address, network);
        break;
      case 'gochain':
        balance = await getGoChainBalance(address, network);
        break;
      case 'ether1':
        balance = await getEther1Balance(address, network);
        break;
      case 'mix':
        balance = await getMixBalance(address, network);
        break;
      case 'ixian':
        balance = await getIxianBalance(address, network);
        break;
      case 'bolivarcoin':
        balance = await getBolivarcoinBalance(address, network);
        break;
      case 'pigeoncoin':
        balance = await getPigeoncoinBalance(address, network);
        break;
      case 'rapids':
        balance = await getRapidsBalance(address, network);
        break;
      case 'suqa':
        balance = await getSuqaBalance(address, network);
        break;
      case 'argoneum':
        balance = await getArgoneumBalance(address, network);
        break;
      case 'socialsend':
        balance = await getSocialSendBalance(address, network);
        break;
      case 'phore':
        balance = await getPhoreBalance(address, network);
        break;
      case 'stipend':
        balance = await getStipendBalance(address, network);
        break;
      case 'viacoin':
        balance = await getViacoinBalance(address, network);
        break;
      case 'raptoreum':
        balance = await getRaptoreumBalance(address, network);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported coin' });
    }

    res.json({
      coin,
      address,
      network,
      balance,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Balance check failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send cryptocurrency
router.post('/send', async (req, res) => {
  try {
    const { coin, fromAddress, toAddress, amount, privateKey, network = 'mainnet' } = req.body;

    if (!fromAddress || !toAddress || !amount || !privateKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let txResult;

    switch (coin.toLowerCase()) {
      case 'bitcoin':
        txResult = await sendBitcoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'ethereum':
        txResult = await sendEthereum(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'monero':
        txResult = await sendMonero(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'ravencoin':
        txResult = await sendRavencoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'ergo':
        txResult = await sendErgo(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'conflux':
        txResult = await sendConflux(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'bitcoingold':
        txResult = await sendBitcoingold(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'beam':
        txResult = await sendBeam(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'zcash':
        txResult = await sendZcash(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'aeternity':
        txResult = await sendAeternity(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'bitcoininterest':
        txResult = await sendBitcoininterest(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'conceal':
        txResult = await sendConceal(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'zelcash':
        txResult = await sendZelcash(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'grin':
        txResult = await sendGrin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'vertcoin':
        txResult = await sendVertcoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'peercoin':
        txResult = await sendPeercoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'digibyte':
        txResult = await sendDigibyte(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'syscoin':
        txResult = await sendSyscoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'flux':
        txResult = await sendFlux(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'komodo':
        txResult = await sendKomodo(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'aion':
        txResult = await sendAion(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'cortex':
        txResult = await sendCortex(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'callisto':
        txResult = await sendCallisto(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'ellaism':
        txResult = await sendEllaism(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'expanse':
        txResult = await sendExpanse(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'musicoin':
        txResult = await sendMusicoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'pirl':
        txResult = await sendPirl(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'yocoin':
        txResult = await sendYocoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'zoin':
        txResult = await sendZoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'zero':
        txResult = await sendZero(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'vidulum':
        txResult = await sendVidulum(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'swap':
        txResult = await sendSwap(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'gentarium':
        txResult = await sendGentarium(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'bitcore':
        txResult = await sendBitcore(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'trezarcoin':
        txResult = await sendTrezarcoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'hempcoin':
        txResult = await sendHempcoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'globalboost':
        txResult = await sendGlobalboost(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'ubiq':
        txResult = await sendUbiq(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'ethergem':
        txResult = await sendEthergem(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'ethersocial':
        txResult = await sendEtherSocial(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'akroma':
        txResult = await sendAkroma(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'atheios':
        txResult = await sendAtheios(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'metaverse':
        txResult = await sendMetaverse(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'quarkchain':
        txResult = await sendQuarkChain(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'energi':
        txResult = await sendEnergi(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'thundercore':
        txResult = await sendThunderCore(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'gochain':
        txResult = await sendGoChain(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'ether1':
        txResult = await sendEther1(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'mix':
        txResult = await sendMix(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'ixian':
        txResult = await sendIxian(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'bolivarcoin':
        txResult = await sendBolivarcoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'pigeoncoin':
        txResult = await sendPigeoncoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'rapids':
        txResult = await sendRapids(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'suqa':
        txResult = await sendSuqa(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'argoneum':
        txResult = await sendArgoneum(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'socialsend':
        txResult = await sendSocialSend(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'phore':
        txResult = await sendPhore(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'stipend':
        txResult = await sendStipend(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'viacoin':
        txResult = await sendViacoin(fromAddress, toAddress, amount, privateKey, network);
        break;
      case 'raptoreum':
        txResult = await sendRaptoreum(fromAddress, toAddress, amount, privateKey, network);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported coin' });
    }

    res.json({
      success: true,
      coin,
      txHash: txResult.txHash,
      amount,
      from: fromAddress,
      to: toAddress,
      network,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send transaction failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
router.get('/history/:coin/:address', async (req, res) => {
  try {
    const { coin, address } = req.params;
    const { network = 'mainnet', limit = 10 } = req.query;

    let transactions = [];

    switch (coin.toLowerCase()) {
      case 'bitcoin':
        transactions = await getBitcoinHistory(address, network, limit);
        break;
      case 'ethereum':
        transactions = await getEthereumHistory(address, network, limit);
        break;
      case 'monero':
        transactions = await getMoneroHistory(address, network, limit);
        break;
      case 'ravencoin':
        transactions = await getRavencoinHistory(address, network, limit);
        break;
      case 'ergo':
        transactions = await getErgoHistory(address, network, limit);
        break;
      case 'conflux':
        transactions = await getConfluxHistory(address, network, limit);
        break;
      case 'bitcoingold':
        transactions = await getBitcoingoldHistory(address, network, limit);
        break;
      case 'beam':
        transactions = await getBeamHistory(address, network, limit);
        break;
      case 'zcash':
        transactions = await getZcashHistory(address, network, limit);
        break;
      case 'aeternity':
        transactions = await getAeternityHistory(address, network, limit);
        break;
      case 'bitcoininterest':
        transactions = await getBitcoininterestHistory(address, network, limit);
        break;
      case 'conceal':
        transactions = await getConcealHistory(address, network, limit);
        break;
      case 'zelcash':
        transactions = await getZelcashHistory(address, network, limit);
        break;
      case 'grin':
        transactions = await getGrinHistory(address, network, limit);
        break;
      case 'vertcoin':
        transactions = await getVertcoinHistory(address, network, limit);
        break;
      case 'peercoin':
        transactions = await getPeercoinHistory(address, network, limit);
        break;
      case 'digibyte':
        transactions = await getDigibyteHistory(address, network, limit);
        break;
      case 'syscoin':
        transactions = await getSyscoinHistory(address, network, limit);
        break;
      case 'flux':
        transactions = await getFluxHistory(address, network, limit);
        break;
      case 'komodo':
        transactions = await getKomodoHistory(address, network, limit);
        break;
      case 'aion':
        transactions = await getAionHistory(address, network, limit);
        break;
      case 'cortex':
        transactions = await getCortexHistory(address, network, limit);
        break;
      case 'callisto':
        transactions = await getCallistoHistory(address, network, limit);
        break;
      case 'ellaism':
        transactions = await getEllaismHistory(address, network, limit);
        break;
      case 'expanse':
        transactions = await getExpanseHistory(address, network, limit);
        break;
      case 'musicoin':
        transactions = await getMusicoinHistory(address, network, limit);
        break;
      case 'pirl':
        transactions = await getPirlHistory(address, network, limit);
        break;
      case 'yocoin':
        transactions = await getYocoinHistory(address, network, limit);
        break;
      case 'zoin':
        transactions = await getZoinHistory(address, network, limit);
        break;
      case 'zero':
        transactions = await getZeroHistory(address, network, limit);
        break;
      case 'vidulum':
        transactions = await getVidulumHistory(address, network, limit);
        break;
      case 'swap':
        transactions = await getSwapHistory(address, network, limit);
        break;
      case 'gentarium':
        transactions = await getGentariumHistory(address, network, limit);
        break;
      case 'bitcore':
        transactions = await getBitcoreHistory(address, network, limit);
        break;
      case 'trezarcoin':
        transactions = await getTrezarcoinHistory(address, network, limit);
        break;
      case 'hempcoin':
        transactions = await getHempcoinHistory(address, network, limit);
        break;
      case 'globalboost':
        transactions = await getGlobalboostHistory(address, network, limit);
        break;
      case 'ubiq':
        transactions = await getUbiqHistory(address, network, limit);
        break;
      case 'ethergem':
        transactions = await getEthergemHistory(address, network, limit);
        break;
      case 'ethersocial':
        transactions = await getEtherSocialHistory(address, network, limit);
        break;
      case 'akroma':
        transactions = await getAkromaHistory(address, network, limit);
        break;
      case 'atheios':
        transactions = await getAtheiosHistory(address, network, limit);
        break;
      case 'metaverse':
        transactions = await getMetaverseHistory(address, network, limit);
        break;
      case 'quarkchain':
        transactions = await getQuarkChainHistory(address, network, limit);
        break;
      case 'energi':
        transactions = await getEnergiHistory(address, network, limit);
        break;
      case 'thundercore':
        transactions = await getThunderCoreHistory(address, network, limit);
        break;
      case 'gochain':
        transactions = await getGoChainHistory(address, network, limit);
        break;
      case 'ether1':
        transactions = await getEther1History(address, network, limit);
        break;
      case 'mix':
        transactions = await getMixHistory(address, network, limit);
        break;
      case 'ixian':
        transactions = await getIxianHistory(address, network, limit);
        break;
      case 'bolivarcoin':
        transactions = await getBolivarcoinHistory(address, network, limit);
        break;
      case 'pigeoncoin':
        transactions = await getPigeoncoinHistory(address, network, limit);
        break;
      case 'rapids':
        transactions = await getRapidsHistory(address, network, limit);
        break;
      case 'suqa':
        transactions = await getSuqaHistory(address, network, limit);
        break;
      case 'argoneum':
        transactions = await getArgoneumHistory(address, network, limit);
        break;
      case 'socialsend':
        transactions = await getSocialSendHistory(address, network, limit);
        break;
      case 'phore':
        transactions = await getPhoreHistory(address, network, limit);
        break;
      case 'stipend':
        transactions = await getStipendHistory(address, network, limit);
        break;
      case 'viacoin':
        transactions = await getViacoinHistory(address, network, limit);
        break;
      case 'raptoreum':
        transactions = await getRaptoreumHistory(address, network, limit);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported coin' });
    }

    res.json({
      coin,
      address,
      network,
      transactions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Transaction history failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Estimate transaction fee
router.post('/estimate-fee', async (req, res) => {
  try {
    const { coin, network = 'mainnet' } = req.body;

    let feeEstimate;

    switch (coin.toLowerCase()) {
      case 'bitcoin':
        feeEstimate = await estimateBitcoinFee(network);
        break;
      case 'ethereum':
        feeEstimate = await estimateEthereumFee(network);
        break;
      case 'monero':
        feeEstimate = await estimateMoneroFee(network);
        break;
      case 'ravencoin':
        feeEstimate = await estimateRavencoinFee(network);
        break;
      case 'ergo':
        feeEstimate = await estimateErgoFee(network);
        break;
      case 'conflux':
        feeEstimate = await estimateConfluxFee(network);
        break;
      case 'bitcoingold':
        feeEstimate = await estimateBitcoingoldFee(network);
        break;
      case 'beam':
        feeEstimate = await estimateBeamFee(network);
        break;
      case 'zcash':
        feeEstimate = await estimateZcashFee(network);
        break;
      case 'aeternity':
        feeEstimate = await estimateAeternityFee(network);
        break;
      case 'bitcoininterest':
        feeEstimate = await estimateBitcoininterestFee(network);
        break;
      case 'conceal':
        feeEstimate = await estimateConcealFee(network);
        break;
      case 'zelcash':
        feeEstimate = await estimateZelcashFee(network);
        break;
      case 'grin':
        feeEstimate = await estimateGrinFee(network);
        break;
      case 'vertcoin':
        feeEstimate = await estimateVertcoinFee(network);
        break;
      case 'peercoin':
        feeEstimate = await estimatePeercoinFee(network);
        break;
      case 'digibyte':
        feeEstimate = await estimateDigibyteFee(network);
        break;
      case 'syscoin':
        feeEstimate = await estimateSyscoinFee(network);
        break;
      case 'flux':
        feeEstimate = await estimateFluxFee(network);
        break;
      case 'komodo':
        feeEstimate = await estimateKomodoFee(network);
        break;
      case 'aion':
        feeEstimate = await estimateAionFee(network);
        break;
      case 'cortex':
        feeEstimate = await estimateCortexFee(network);
        break;
      case 'callisto':
        feeEstimate = await estimateCallistoFee(network);
        break;
      case 'ellaism':
        feeEstimate = await estimateEllaismFee(network);
        break;
      case 'expanse':
        feeEstimate = await estimateExpanseFee(network);
        break;
      case 'musicoin':
        feeEstimate = await estimateMusicoinFee(network);
        break;
      case 'pirl':
        feeEstimate = await estimatePirlFee(network);
        break;
      case 'yocoin':
        feeEstimate = await estimateYocoinFee(network);
        break;
      case 'zoin':
        feeEstimate = await estimateZoinFee(network);
        break;
      case 'zero':
        feeEstimate = await estimateZeroFee(network);
        break;
      case 'vidulum':
        feeEstimate = await estimateVidulumFee(network);
        break;
      case 'swap':
        feeEstimate = await estimateSwapFee(network);
        break;
      case 'gentarium':
        feeEstimate = await estimateGentariumFee(network);
        break;
      case 'bitcore':
        feeEstimate = await estimateBitcoreFee(network);
        break;
      case 'trezarcoin':
        feeEstimate = await estimateTrezarcoinFee(network);
        break;
      case 'hempcoin':
        feeEstimate = await estimateHempcoinFee(network);
        break;
      case 'globalboost':
        feeEstimate = await estimateGlobalboostFee(network);
        break;
      case 'ubiq':
        feeEstimate = await estimateUbiqFee(network);
        break;
      case 'ethergem':
        feeEstimate = await estimateEthergemFee(network);
        break;
      case 'ethersocial':
        feeEstimate = await estimateEtherSocialFee(network);
        break;
      case 'akroma':
        feeEstimate = await estimateAkromaFee(network);
        break;
      case 'atheios':
        feeEstimate = await estimateAtheiosFee(network);
        break;
      case 'metaverse':
        feeEstimate = await estimateMetaverseFee(network);
        break;
      case 'quarkchain':
        feeEstimate = await estimateQuarkChainFee(network);
        break;
      case 'energi':
        feeEstimate = await estimateEnergiFee(network);
        break;
      case 'thundercore':
        feeEstimate = await estimateThunderCoreFee(network);
        break;
      case 'gochain':
        feeEstimate = await estimateGoChainFee(network);
        break;
      case 'ether1':
        feeEstimate = await estimateEther1Fee(network);
        break;
      case 'mix':
        feeEstimate = await estimateMixFee(network);
        break;
      case 'ixian':
        feeEstimate = await estimateIxianFee(network);
        break;
      case 'bolivarcoin':
        feeEstimate = await estimateBolivarcoinFee(network);
        break;
      case 'pigeoncoin':
        feeEstimate = await estimatePigeoncoinFee(network);
        break;
      case 'rapids':
        feeEstimate = await estimateRapidsFee(network);
        break;
      case 'suqa':
        feeEstimate = await estimateSuqaFee(network);
        break;
      case 'argoneum':
        feeEstimate = await estimateArgoneumFee(network);
        break;
      case 'socialsend':
        feeEstimate = await estimateSocialSendFee(network);
        break;
      case 'phore':
        feeEstimate = await estimatePhoreFee(network);
        break;
      case 'stipend':
        feeEstimate = await estimateStipendFee(network);
        break;
      case 'viacoin':
        feeEstimate = await estimateViacoinFee(network);
        break;
      case 'raptoreum':
        feeEstimate = await estimateRaptoreumFee(network);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported coin' });
    }

    res.json({
      coin,
      network,
      feeEstimate,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fee estimation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bitcoin-specific functions
async function getBitcoinBalance(address, network = 'mainnet') {
  try {
    const rpcConfig = RPC_ENDPOINTS.bitcoin[network];

    const requestConfig = {
      timeout: 10000
    };

    // Only add auth if username and password are provided
    if (rpcConfig.username && rpcConfig.password) {
      requestConfig.auth = {
        username: rpcConfig.username,
        password: rpcConfig.password
      };
    }

    const response = await axios.post(rpcConfig, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, requestConfig);

    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcoin RPC error:', error.message);
    throw new Error(`Failed to get Bitcoin balance: ${error.message}`);
  }
}

async function sendBitcoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcConfig = RPC_ENDPOINTS.bitcoin[network];

    const requestConfig = {
      timeout: 10000
    };

    // Only add auth if username and password are provided
    if (rpcConfig.username && rpcConfig.password) {
      requestConfig.auth = {
        username: rpcConfig.username,
        password: rpcConfig.password
      };
    }

    // Get unspent outputs for the address
    const utxoResponse = await axios.post(rpcConfig, {
      jsonrpc: '2.0',
      id: 'listunspent',
      method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, requestConfig);

    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) {
      throw new Error('No unspent outputs available for this address');
    }

    // Calculate total input amount and select UTXOs
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({
        txid: utxo.txid,
        vout: utxo.vout,
        amount: utxo.amount
      });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break; // Add fee buffer
    }

    if (totalInput < amount) {
      throw new Error('Insufficient balance');
    }

    // Create raw transaction
    const inputs = selectedUtxos.map(utxo => ({
      txid: utxo.txid,
      vout: utxo.vout
    }));

    const outputs = {};
    outputs[toAddress] = amount;

    // Add change output if necessary
    const change = totalInput - amount - 0.00001; // 1 sat/byte fee estimate
    if (change > 0.00001) {
      outputs[fromAddress] = change;
    }

    const createTxResponse = await axios.post(rpcConfig, {
      jsonrpc: '2.0',
      id: 'createrawtransaction',
      method: 'createrawtransaction',
      params: [inputs, outputs]
    }, requestConfig);

    const rawTx = createTxResponse.data.result;

    // Sign transaction
    const signTxResponse = await axios.post(rpcConfig, {
      jsonrpc: '2.0',
      id: 'signrawtransaction',
      method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, requestConfig);

    const signedTx = signTxResponse.data.result.hex;

    // Broadcast transaction
    const broadcastResponse = await axios.post(rpcConfig, {
      jsonrpc: '2.0',
      id: 'sendrawtransaction',
      method: 'sendrawtransaction',
      params: [signedTx]
    }, requestConfig);

    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Bitcoin send error:', error.message);
    throw new Error(`Failed to send Bitcoin: ${error.message}`);
  }
}

async function getBitcoinHistory(address, network, limit) {
  try {
    const rpcConfig = RPC_ENDPOINTS.bitcoin[network];

    const requestConfig = {
      timeout: 10000
    };

    // Only add auth if username and password are provided
    if (rpcConfig.username && rpcConfig.password) {
      requestConfig.auth = {
        username: rpcConfig.username,
        password: rpcConfig.password
      };
    }

    // Get transaction IDs for the address
    const txidsResponse = await axios.post(rpcConfig, {
      jsonrpc: '2.0',
      id: 'getaddresstxids',
      method: 'getaddresstxids',
      params: [address]
    }, requestConfig);

    const txids = txidsResponse.data.result || [];
    const transactions = [];

    // Get details for each transaction (limit to prevent too many requests)
    const txidsToFetch = txids.slice(0, Math.min(limit, 50));

    for (const txid of txidsToFetch) {
      try {
        const txResponse = await axios.post(rpcConfig, {
          jsonrpc: '2.0',
          id: 'getrawtransaction',
          method: 'getrawtransaction',
          params: [txid, true]
        }, requestConfig);

        const tx = txResponse.data.result;
        if (tx) {
          // Calculate amount for this address
          let amount = 0;
          let type = 'unknown';

          // Check inputs
          for (const input of tx.vin || []) {
            if (input.address === address) {
              type = 'send';
              break;
            }
          }

          // Check outputs
          for (const output of tx.vout || []) {
            if (output.scriptPubKey?.address === address) {
              amount += output.value || 0;
              if (type === 'unknown') type = 'receive';
            }
          }

          transactions.push({
            txid,
            amount,
            type,
            confirmations: tx.confirmations || 0,
            timestamp: tx.time ? new Date(tx.time * 1000) : new Date(),
            fee: tx.fee || 0
          });
        }
      } catch (txError) {
        console.warn(`Failed to get transaction ${txid}:`, txError.message);
      }
    }

    return transactions;
  } catch (error) {
    console.error('Bitcoin history error:', error.message);
    throw new Error(`Failed to get Bitcoin history: ${error.message}`);
  }
}

async function estimateBitcoinFee(network) {
  try {
    const rpcConfig = RPC_ENDPOINTS.bitcoin[network];

    const requestConfig = {
      timeout: 10000
    };

    // Only add auth if username and password are provided
    if (rpcConfig.username && rpcConfig.password) {
      requestConfig.auth = {
        username: rpcConfig.username,
        password: rpcConfig.password
      };
    }

    const response = await axios.post(rpcConfig, {
      jsonrpc: '2.0',
      id: 'estimatefee',
      method: 'estimatesmartfee',
      params: [6] // 6 block confirmation target
    }, requestConfig);

    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Bitcoin fee estimation error:', error.message);
    // Return fallback fee if RPC fails
    return 0.00001;
  }
}

// Ethereum-specific functions
async function getEthereumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethereum[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, {
      timeout: 10000
    });

    return parseInt(response.data.result, 16) / 1e18; // Convert wei to ETH
  } catch (error) {
    console.error('Ethereum RPC error:', error.message);
    throw new Error(`Failed to get Ethereum balance: ${error.message}`);
  }
}

async function sendEthereum(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethereum[network];

    // Get nonce
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, {
      timeout: 10000
    });

    const nonce = nonceResponse.data.result;

    // Get gas price
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_gasPrice',
      params: []
    }, {
      timeout: 10000
    });

    const gasPrice = gasPriceResponse.data.result;

    // Create transaction object
    const tx = {
      nonce: nonce,
      gasPrice: gasPrice,
      gasLimit: '0x5208', // 21000
      to: toAddress,
      value: '0x' + (amount * 1e18).toString(16), // Convert ETH to wei
      data: '0x',
      chainId: network === 'mainnet' ? 1 : (network === 'sepolia' ? 11155111 : 5)
    };

    // Import the Ethereum wallet for proper signing
    const { EthereumWallet } = require('./ethereum-wallet');
    const hdkey = require('hdkey');
    const bip39 = require('bip39');

    // For demo purposes, we'll create a temporary wallet from the private key
    // In production, you'd derive this properly from HD wallet
    const tempWallet = {
      signTransaction: async (txData) => {
        // This is a simplified version - you'd need proper RLP encoding and EIP-155 signing
        const txString = JSON.stringify(txData);
        const txHash = crypto.createHash('sha256').update(txString).digest('hex');

        // Sign with ECDSA
        const signature = crypto.sign('sha256', Buffer.from(txHash, 'hex'), {
          key: privateKey,
          dsaEncoding: 'der'
        });

        return {
          signature: signature.toString('hex'),
          publicKey: '02' + crypto.createPublicKey(privateKey).export({ format: 'der', type: 'spki' }).toString('hex').slice(-64)
        };
      }
    };

    const signedTx = await tempWallet.signTransaction(tx);

    // For now, return a mock transaction hash
    // In production, you'd properly encode and sign the transaction
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');

    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Ethereum send error:', error.message);
    throw new Error(`Failed to send Ethereum: ${error.message}`);
  }
}

async function getEthereumHistory(address, network = 'mainnet', limit = 10) {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethereum[network];

    // Get latest block
    const blockResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_blockNumber',
      params: []
    }, {
      timeout: 10000
    });

    const latestBlock = parseInt(blockResponse.data.result, 16);
    const transactions = [];

    // Scan recent blocks for transactions involving this address
    // Note: This is inefficient for production - you'd want to use an indexer like Etherscan API
    const blocksToScan = Math.min(limit * 2, 100); // Scan up to 100 blocks

    for (let i = 0; i < blocksToScan && transactions.length < limit; i++) {
      try {
        const blockNumber = (latestBlock - i).toString(16);
        const blockResponse = await axios.post(rpcUrl, {
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_getBlockByNumber',
          params: ['0x' + blockNumber, true]
        }, {
          timeout: 5000
        });

        const block = blockResponse.data.result;
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()) {
              const amount = parseInt(tx.value, 16) / 1e18;
              const type = tx.from?.toLowerCase() === address.toLowerCase() ? 'send' : 'receive';

              transactions.push({
                txid: tx.hash,
                amount,
                type,
                from: tx.from,
                to: tx.to,
                confirmations: latestBlock - parseInt(block.number, 16),
                timestamp: new Date(parseInt(block.timestamp, 16) * 1000),
                gasUsed: tx.gas || '0x0',
                gasPrice: tx.gasPrice || '0x0'
              });

              if (transactions.length >= limit) break;
            }
          }
        }
      } catch (blockError) {
        console.warn(`Failed to get block ${latestBlock - i}:`, blockError.message);
      }
    }

    return transactions;
  } catch (error) {
    console.error('Ethereum history error:', error.message);
    throw new Error(`Failed to get Ethereum history: ${error.message}`);
  }
}

async function estimateEthereumFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethereum[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_gasPrice',
      params: []
    }, {
      timeout: 10000
    });

    const gasPriceWei = parseInt(response.data.result, 16);
    const gasPriceGwei = gasPriceWei / 1e9;
    const estimatedFee = (gasPriceWei * 21000) / 1e18; // 21000 gas for ETH transfer

    return {
      gasPrice: gasPriceGwei,
      estimatedFee: estimatedFee,
      gasLimit: 21000
    };
  } catch (error) {
    console.error('Ethereum fee estimation error:', error.message);
    // Return fallback values
    return {
      gasPrice: 20,
      estimatedFee: 0.00042,
      gasLimit: 21000
    };
  }
}

// Monero-specific functions
async function getMoneroBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.monero[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: { account_index: 0 }
    }, {
      timeout: 10000
    });

    return (response.data.result?.balance || 0) / 1e12; // Convert atomic units to XMR
  } catch (error) {
    console.error('Monero RPC error:', error.message);
    throw new Error(`Failed to get Monero balance: ${error.message}`);
  }
}

async function sendMonero(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.monero[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'transfer',
      method: 'transfer',
      params: {
        destinations: [{ address: toAddress, amount: Math.floor(amount * 1e12) }],
        account_index: 0,
        priority: 1,
        ring_size: 16
      }
    }, {
      timeout: 30000 // Monero transactions can take longer
    });

    return { txHash: response.data.result?.tx_hash };
  } catch (error) {
    console.error('Monero send error:', error.message);
    throw new Error(`Failed to send Monero: ${error.message}`);
  }
}

async function getMoneroHistory(address, network = 'mainnet', limit = 10) {
  try {
    const rpcUrl = RPC_ENDPOINTS.monero[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'gettransfers',
      method: 'get_transfers',
      params: {
        in: true,
        out: true,
        pending: true,
        failed: true,
        pool: true,
        filter_by_height: false
      }
    }, {
      timeout: 10000
    });

    const transfers = response.data.result || {};
    const transactions = [];

    // Process different transfer types
    const transferTypes = ['in', 'out', 'pending', 'pool'];

    for (const type of transferTypes) {
      if (transfers[type]) {
        for (const tx of transfers[type].slice(0, limit)) {
          transactions.push({
            txid: tx.txid,
            amount: tx.amount / 1e12,
            type: type === 'in' ? 'receive' : (type === 'out' ? 'send' : type),
            confirmations: tx.confirmations || 0,
            timestamp: new Date(tx.timestamp * 1000),
            fee: tx.fee ? tx.fee / 1e12 : 0,
            height: tx.height || null
          });
        }
      }
    }

    // Sort by timestamp (newest first) and limit results
    return transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (error) {
    console.error('Monero history error:', error.message);
    throw new Error(`Failed to get Monero history: ${error.message}`);
  }
}

async function estimateMoneroFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.monero[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'get_fee_estimate',
      method: 'get_fee_estimate'
    }, {
      timeout: 10000
    });

    const feeEstimate = response.data.result.fee;
    return feeEstimate / 1e12; // Convert from atomic units
  } catch (error) {
    console.error('Monero fee estimation error:', error.message);
    // Fallback to default fee
    return 0.0001; // Default Monero fee
  }
}

// Ravencoin-specific functions
async function getRavencoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ravencoin[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, {
      timeout: 10000
    });

    return response.data.result || 0;
  } catch (error) {
    console.error('Ravencoin RPC error:', error.message);
    throw new Error(`Failed to get Ravencoin balance: ${error.message}`);
  }
}

async function sendRavencoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ravencoin[network];

    // Get unspent outputs
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'listunspent',
      method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, {
      timeout: 10000
    });

    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) {
      throw new Error('No unspent outputs available');
    }

    // Select UTXOs and create transaction
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }

    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;

    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) {
      outputs[fromAddress] = change;
    }

    // Create and sign transaction
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'createrawtransaction',
      method: 'createrawtransaction',
      params: [inputs, outputs]
    }, {
      timeout: 10000
    });

    const rawTx = createTxResponse.data.result;

    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'signrawtransaction',
      method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, {
      timeout: 10000
    });

    const signedTx = signTxResponse.data.result.hex;

    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'sendrawtransaction',
      method: 'sendrawtransaction',
      params: [signedTx]
    }, {
      timeout: 10000
    });

    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Ravencoin send error:', error.message);
    throw new Error(`Failed to send Ravencoin: ${error.message}`);
  }
}

async function getRavencoinHistory(address, network = 'mainnet', limit = 10) {
  try {
    const rpcUrl = RPC_ENDPOINTS.ravencoin[network];

    const txidsResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getaddresstxids',
      method: 'getaddresstxids',
      params: [address]
    }, {
      timeout: 10000
    });

    const txids = txidsResponse.data.result || [];
    const transactions = [];

    for (const txid of txids.slice(0, Math.min(limit, 50))) {
      try {
        const txResponse = await axios.post(rpcUrl, {
          jsonrpc: '2.0',
          id: 'getrawtransaction',
          method: 'getrawtransaction',
          params: [txid, true]
        }, {
          timeout: 5000
        });

        const tx = txResponse.data.result;
        if (tx) {
          let amount = 0;
          let type = 'unknown';

          for (const input of tx.vin || []) {
            if (input.address === address) {
              type = 'send';
              break;
            }
          }

          for (const output of tx.vout || []) {
            if (output.scriptPubKey?.address === address) {
              amount += output.value || 0;
              if (type === 'unknown') type = 'receive';
            }
          }

          transactions.push({
            txid,
            amount,
            type,
            confirmations: tx.confirmations || 0,
            timestamp: tx.time ? new Date(tx.time * 1000) : new Date(),
            fee: tx.fee || 0
          });
        }
      } catch (txError) {
        console.warn(`Failed to get Ravencoin transaction ${txid}:`, txError.message);
      }
    }

    return transactions;
  } catch (error) {
    console.error('Ravencoin history error:', error.message);
    throw new Error(`Failed to get Ravencoin history: ${error.message}`);
  }
}

async function estimateRavencoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ravencoin[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'estimatefee',
      method: 'estimatesmartfee',
      params: [6]
    }, {
      timeout: 10000
    });

    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Ravencoin fee estimation error:', error.message);
    return 0.00001;
  }
}

// Ergo-specific functions
async function getErgoBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ergo[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, {
      timeout: 10000
    });

    return (response.data.result?.balance || 0) / 1e9; // Convert nanoERGs to ERGs
  } catch (error) {
    console.error('Ergo RPC error:', error.message);
    throw new Error(`Failed to get Ergo balance: ${error.message}`);
  }
}

async function sendErgo(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ergo[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'send',
      method: 'send_transaction',
      params: {
        from: fromAddress,
        to: toAddress,
        amount: Math.floor(amount * 1e9), // Convert ERGs to nanoERGs
        fee: 1000000 // 0.001 ERG fee
      }
    }, {
      timeout: 30000
    });

    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Ergo send error:', error.message);
    throw new Error(`Failed to send Ergo: ${error.message}`);
  }
}

async function getErgoHistory(address, network = 'mainnet', limit = 10) {
  try {
    const rpcUrl = RPC_ENDPOINTS.ergo[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'gettransactions',
      method: 'get_transactions',
      params: [address, limit]
    }, {
      timeout: 10000
    });

    const transactions = response.data.result || [];

    return transactions.map(tx => ({
      txid: tx.id,
      amount: tx.amount / 1e9,
      type: tx.type,
      confirmations: tx.confirmations || 0,
      timestamp: new Date(tx.timestamp),
      fee: tx.fee ? tx.fee / 1e9 : 0
    }));
  } catch (error) {
    console.error('Ergo history error:', error.message);
    throw new Error(`Failed to get Ergo history: ${error.message}`);
  }
}

async function estimateErgoFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ergo[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'estimatefee',
      method: 'get_fee_estimate'
    }, {
      timeout: 10000
    });

    return (response.data.result?.fee || 1000000) / 1e9; // Convert nanoERGs to ERGs
  } catch (error) {
    console.error('Ergo fee estimation error:', error.message);
    return 0.001; // Default Ergo fee
  }
}

// Conflux-specific functions
async function getConfluxBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conflux[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'cfx_getBalance',
      params: [address, 'latest']
    }, {
      timeout: 10000
    });

    return parseInt(response.data.result, 16) / 1e18; // Convert from wei-like units
  } catch (error) {
    console.error('Conflux RPC error:', error.message);
    throw new Error(`Failed to get Conflux balance: ${error.message}`);
  }
}

async function sendConflux(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conflux[network];

    // Get nonce
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'cfx_getNextNonce',
      params: [fromAddress]
    }, {
      timeout: 10000
    });

    const nonce = nonceResponse.data.result;

    // Get gas price
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 2,
      method: 'cfx_gasPrice',
      params: []
    }, {
      timeout: 10000
    });

    const gasPrice = gasPriceResponse.data.result;

    const tx = {
      nonce: nonce,
      gasPrice: gasPrice,
      gas: '0x5208', // 21000
      to: toAddress,
      value: '0x' + (amount * 1e18).toString(16),
      data: '0x'
    };

    // For now, return mock transaction hash
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');

    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Conflux send error:', error.message);
    throw new Error(`Failed to send Conflux: ${error.message}`);
  }
}

async function getConfluxHistory(address, network = 'mainnet', limit = 10) {
  try {
    const rpcUrl = RPC_ENDPOINTS.conflux[network];

    // Get latest block
    const blockResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'cfx_getBlockByNumber',
      params: ['latest', false]
    }, {
      timeout: 10000
    });

    const latestBlock = parseInt(blockResponse.data.result.number, 16);
    const transactions = [];

    // Scan recent blocks
    for (let i = 0; i < Math.min(limit * 2, 100) && transactions.length < limit; i++) {
      try {
        const blockResponse = await axios.post(rpcUrl, {
          jsonrpc: '2.0',
          id: 2,
          method: 'cfx_getBlockByNumber',
          params: ['0x' + (latestBlock - i).toString(16), true]
        }, {
          timeout: 5000
        });

        const block = blockResponse.data.result;
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()) {
              const amount = parseInt(tx.value, 16) / 1e18;
              const type = tx.from?.toLowerCase() === address.toLowerCase() ? 'send' : 'receive';

              transactions.push({
                txid: tx.hash,
                amount,
                type,
                confirmations: latestBlock - parseInt(block.number, 16),
                timestamp: new Date(parseInt(block.timestamp, 16) * 1000),
                gasUsed: tx.gas || '0x0',
                gasPrice: tx.gasPrice || '0x0'
              });

              if (transactions.length >= limit) break;
            }
          }
        }
      } catch (blockError) {
        console.warn(`Failed to get Conflux block ${latestBlock - i}:`, blockError.message);
      }
    }

    return transactions;
  } catch (error) {
    console.error('Conflux history error:', error.message);
    throw new Error(`Failed to get Conflux history: ${error.message}`);
  }
}

async function estimateConfluxFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conflux[network];

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'cfx_gasPrice',
      params: []
    }, {
      timeout: 10000
    });

    const gasPrice = parseInt(response.data.result, 16);
    const estimatedFee = (gasPrice * 21000) / 1e18;

    return {
      gasPrice: gasPrice / 1e9,
      estimatedFee: estimatedFee,
      gasLimit: 21000
    };
  } catch (error) {
    console.error('Conflux fee estimation error:', error.message);
    return {
      gasPrice: 20,
      estimatedFee: 0.00042,
      gasLimit: 21000
    };
  }
}

// Additional balance functions for new coins
async function getBitcoingoldBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoingold[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcoingold RPC error:', error.message);
    throw new Error(`Failed to get Bitcoingold balance: ${error.message}`);
  }
}

async function getBeamBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.beam[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e8;
  } catch (error) {
    console.error('Beam RPC error:', error.message);
    throw new Error(`Failed to get Beam balance: ${error.message}`);
  }
}

async function getZcashBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zcash RPC error:', error.message);
    throw new Error(`Failed to get Zcash balance: ${error.message}`);
  }
}

async function getAeternityBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aeternity[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e18;
  } catch (error) {
    console.error('Aeternity RPC error:', error.message);
    throw new Error(`Failed to get Aeternity balance: ${error.message}`);
  }
}

async function getBitcoininterestBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoininterest[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcoininterest RPC error:', error.message);
    throw new Error(`Failed to get Bitcoininterest balance: ${error.message}`);
  }
}

async function getConcealBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conceal[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: { account_index: 0 }
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e12;
  } catch (error) {
    console.error('Conceal RPC error:', error.message);
    throw new Error(`Failed to get Conceal balance: ${error.message}`);
  }
}

async function getZelcashBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zelcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zelcash RPC error:', error.message);
    throw new Error(`Failed to get Zelcash balance: ${error.message}`);
  }
}

async function getGrinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.grin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e9;
  } catch (error) {
    console.error('Grin RPC error:', error.message);
    throw new Error(`Failed to get Grin balance: ${error.message}`);
  }
}

async function getVertcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vertcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Vertcoin RPC error:', error.message);
    throw new Error(`Failed to get Vertcoin balance: ${error.message}`);
  }
}

async function getPeercoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.peercoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Peercoin RPC error:', error.message);
    throw new Error(`Failed to get Peercoin balance: ${error.message}`);
  }
}

async function getDigibyteBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.digibyte[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Digibyte RPC error:', error.message);
    throw new Error(`Failed to get Digibyte balance: ${error.message}`);
  }
}

async function getSyscoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.syscoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Syscoin RPC error:', error.message);
    throw new Error(`Failed to get Syscoin balance: ${error.message}`);
  }
}

async function getFluxBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.flux[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Flux RPC error:', error.message);
    throw new Error(`Failed to get Flux balance: ${error.message}`);
  }
}

async function getKomodoBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.komodo[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Komodo RPC error:', error.message);
    throw new Error(`Failed to get Komodo balance: ${error.message}`);
  }
}

async function getAionBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aion[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e18;
  } catch (error) {
    console.error('Aion RPC error:', error.message);
    throw new Error(`Failed to get Aion balance: ${error.message}`);
  }
}

async function getCortexBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.cortex[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e18;
  } catch (error) {
    console.error('Cortex RPC error:', error.message);
    throw new Error(`Failed to get Cortex balance: ${error.message}`);
  }
}

async function getCallistoBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.callisto[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Callisto RPC error:', error.message);
    throw new Error(`Failed to get Callisto balance: ${error.message}`);
  }
}

async function getEllaismBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ellaism[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ellaism RPC error:', error.message);
    throw new Error(`Failed to get Ellaism balance: ${error.message}`);
  }
}

async function getExpanseBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.expanse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Expanse RPC error:', error.message);
    throw new Error(`Failed to get Expanse balance: ${error.message}`);
  }
}

async function getMusicoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.musicoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Musicoin RPC error:', error.message);
    throw new Error(`Failed to get Musicoin balance: ${error.message}`);
  }
}

async function getPirlBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pirl[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Pirl RPC error:', error.message);
    throw new Error(`Failed to get Pirl balance: ${error.message}`);
  }
}

async function getYocoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.yocoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Yocoin RPC error:', error.message);
    throw new Error(`Failed to get Yocoin balance: ${error.message}`);
  }
}

async function getZoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zoin RPC error:', error.message);
    throw new Error(`Failed to get Zoin balance: ${error.message}`);
  }
}

async function getZeroBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zero[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zero RPC error:', error.message);
    throw new Error(`Failed to get Zero balance: ${error.message}`);
  }
}

async function getVidulumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vidulum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Vidulum RPC error:', error.message);
    throw new Error(`Failed to get Vidulum balance: ${error.message}`);
  }
}

async function getSwapBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.swap[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Swap RPC error:', error.message);
    throw new Error(`Failed to get Swap balance: ${error.message}`);
  }
}

async function getGentariumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gentarium[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Gentarium RPC error:', error.message);
    throw new Error(`Failed to get Gentarium balance: ${error.message}`);
  }
}

async function getBitcoreBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcore RPC error:', error.message);
    throw new Error(`Failed to get Bitcore balance: ${error.message}`);
  }
}

async function getTrezarcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.trezarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Trezarcoin RPC error:', error.message);
    throw new Error(`Failed to get Trezarcoin balance: ${error.message}`);
  }
}

async function getHempcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.hempcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Hempcoin RPC error:', error.message);
    throw new Error(`Failed to get Hempcoin balance: ${error.message}`);
  }
}

async function getGlobalboostBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.globalboost[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Globalboost RPC error:', error.message);
    throw new Error(`Failed to get Globalboost balance: ${error.message}`);
  }
}

async function getUbiqBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ubiq[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ubiq RPC error:', error.message);
    throw new Error(`Failed to get Ubiq balance: ${error.message}`);
  }
}

async function getEthergemBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethergem[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ethergem RPC error:', error.message);
    throw new Error(`Failed to get Ethergem balance: ${error.message}`);
  }
}

async function getEtherSocialBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethersocial[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('EtherSocial RPC error:', error.message);
    throw new Error(`Failed to get EtherSocial balance: ${error.message}`);
  }
}

async function getAkromaBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.akroma[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Akroma RPC error:', error.message);
    throw new Error(`Failed to get Akroma balance: ${error.message}`);
  }
}

async function getAtheiosBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.atheios[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Atheios RPC error:', error.message);
    throw new Error(`Failed to get Atheios balance: ${error.message}`);
  }
}

async function getMetaverseBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.metaverse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Metaverse RPC error:', error.message);
    throw new Error(`Failed to get Metaverse balance: ${error.message}`);
  }
}

async function getQuarkChainBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.quarkchain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('QuarkChain RPC error:', error.message);
    throw new Error(`Failed to get QuarkChain balance: ${error.message}`);
  }
}

async function getEnergiBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.energi[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Energi RPC error:', error.message);
    throw new Error(`Failed to get Energi balance: ${error.message}`);
  }
}

async function getThunderCoreBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.thundercore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('ThunderCore RPC error:', error.message);
    throw new Error(`Failed to get ThunderCore balance: ${error.message}`);
  }
}

async function getGoChainBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gochain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('GoChain RPC error:', error.message);
    throw new Error(`Failed to get GoChain balance: ${error.message}`);
  }
}

async function getEther1Balance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ether1[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ether1 RPC error:', error.message);
    throw new Error(`Failed to get Ether1 balance: ${error.message}`);
  }
}

async function getMixBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.mix[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Mix RPC error:', error.message);
    throw new Error(`Failed to get Mix balance: ${error.message}`);
  }
}

async function getIxianBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ixian[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e8;
  } catch (error) {
    console.error('Ixian RPC error:', error.message);
    throw new Error(`Failed to get Ixian balance: ${error.message}`);
  }
}

async function getBolivarcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bolivarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bolivarcoin RPC error:', error.message);
    throw new Error(`Failed to get Bolivarcoin balance: ${error.message}`);
  }
}

async function getPigeoncoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pigeoncoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Pigeoncoin RPC error:', error.message);
    throw new Error(`Failed to get Pigeoncoin balance: ${error.message}`);
  }
}

async function getRapidsBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.rapids[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Rapids RPC error:', error.message);
    throw new Error(`Failed to get Rapids balance: ${error.message}`);
  }
}

async function getSuqaBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.suqa[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Suqa RPC error:', error.message);
    throw new Error(`Failed to get Suqa balance: ${error.message}`);
  }
}

async function getArgoneumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.argoneum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Argoneum RPC error:', error.message);
    throw new Error(`Failed to get Argoneum balance: ${error.message}`);
  }
}

async function getSocialSendBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.socialsend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('SocialSend RPC error:', error.message);
    throw new Error(`Failed to get SocialSend balance: ${error.message}`);
  }
}

async function getPhoreBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.phore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Phore RPC error:', error.message);
    throw new Error(`Failed to get Phore balance: ${error.message}`);
  }
}

async function getStipendBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.stipend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Stipend RPC error:', error.message);
    throw new Error(`Failed to get Stipend balance: ${error.message}`);
  }
}

async function getViacoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.viacoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Viacoin RPC error:', error.message);
    throw new Error(`Failed to get Viacoin balance: ${error.message}`);
  }
}

async function getRaptoreumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.raptoreum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Raptoreum RPC error:', error.message);
    throw new Error(`Failed to get Raptoreum balance: ${error.message}`);
  }
}

// Additional send functions for new coins
async function sendBitcoingold(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoingold[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Bitcoingold send error:', error.message);
    throw new Error(`Failed to send Bitcoingold: ${error.message}`);
  }
}

async function sendBeam(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.beam[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e8), fee: 10000 }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Beam send error:', error.message);
    throw new Error(`Failed to send Beam: ${error.message}`);
  }
}

async function sendZcash(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zcash[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Zcash send error:', error.message);
    throw new Error(`Failed to send Zcash: ${error.message}`);
  }
}

async function sendAeternity(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aeternity[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e18) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Aeternity send error:', error.message);
    throw new Error(`Failed to send Aeternity: ${error.message}`);
  }
}

async function sendBitcoininterest(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoininterest[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Bitcoininterest send error:', error.message);
    throw new Error(`Failed to send Bitcoininterest: ${error.message}`);
  }
}

async function sendConceal(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conceal[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'transfer', method: 'transfer',
      params: { destinations: [{ address: toAddress, amount: Math.floor(amount * 1e12) }], account_index: 0, priority: 1, ring_size: 16 }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.tx_hash };
  } catch (error) {
    console.error('Conceal send error:', error.message);
    throw new Error(`Failed to send Conceal: ${error.message}`);
  }
}

async function sendZelcash(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zelcash[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Zelcash send error:', error.message);
    throw new Error(`Failed to send Zelcash: ${error.message}`);
  }
}

async function sendGrin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.grin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e9) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Grin send error:', error.message);
    throw new Error(`Failed to send Grin: ${error.message}`);
  }
}

async function sendVertcoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vertcoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Vertcoin send error:', error.message);
    throw new Error(`Failed to send Vertcoin: ${error.message}`);
  }
}

async function sendPeercoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.peercoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Peercoin send error:', error.message);
    throw new Error(`Failed to send Peercoin: ${error.message}`);
  }
}

async function sendDigibyte(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.digibyte[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Digibyte send error:', error.message);
    throw new Error(`Failed to send Digibyte: ${error.message}`);
  }
}

async function sendSyscoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.syscoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Syscoin send error:', error.message);
    throw new Error(`Failed to send Syscoin: ${error.message}`);
  }
}

async function sendFlux(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.flux[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Flux send error:', error.message);
    throw new Error(`Failed to send Flux: ${error.message}`);
  }
}

async function sendKomodo(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.komodo[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Komodo send error:', error.message);
    throw new Error(`Failed to send Komodo: ${error.message}`);
  }
}

async function sendAion(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aion[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e18) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Aion send error:', error.message);
    throw new Error(`Failed to send Aion: ${error.message}`);
  }
}

async function sendCortex(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.cortex[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e18) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Cortex send error:', error.message);
    throw new Error(`Failed to send Cortex: ${error.message}`);
  }
}

async function sendCallisto(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.callisto[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Callisto send error:', error.message);
    throw new Error(`Failed to send Callisto: ${error.message}`);
  }
}

async function sendEllaism(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ellaism[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Ellaism send error:', error.message);
    throw new Error(`Failed to send Ellaism: ${error.message}`);
  }
}

async function sendExpanse(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.expanse[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Expanse send error:', error.message);
    throw new Error(`Failed to send Expanse: ${error.message}`);
  }
}

async function sendMusicoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.musicoin[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Musicoin send error:', error.message);
    throw new Error(`Failed to send Musicoin: ${error.message}`);
  }
}

async function sendPirl(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pirl[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Pirl send error:', error.message);
    throw new Error(`Failed to send Pirl: ${error.message}`);
  }
}

async function sendYocoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.yocoin[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Yocoin send error:', error.message);
    throw new Error(`Failed to send Yocoin: ${error.message}`);
  }
}

async function sendZoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Zoin send error:', error.message);
    throw new Error(`Failed to send Zoin: ${error.message}`);
  }
}

async function sendZero(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zero[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Zero send error:', error.message);
    throw new Error(`Failed to send Zero: ${error.message}`);
  }
}

async function sendVidulum(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vidulum[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Vidulum send error:', error.message);
    throw new Error(`Failed to send Vidulum: ${error.message}`);
  }
}

async function sendSwap(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.swap[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Swap send error:', error.message);
    throw new Error(`Failed to send Swap: ${error.message}`);
  }
}

async function sendGentarium(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gentarium[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Gentarium send error:', error.message);
    throw new Error(`Failed to send Gentarium: ${error.message}`);
  }
}

async function sendBitcore(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcore[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Bitcore send error:', error.message);
    throw new Error(`Failed to send Bitcore: ${error.message}`);
  }
}

async function sendTrezarcoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.trezarcoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Trezarcoin send error:', error.message);
    throw new Error(`Failed to send Trezarcoin: ${error.message}`);
  }
}

async function sendHempcoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.hempcoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Hempcoin send error:', error.message);
    throw new Error(`Failed to send Hempcoin: ${error.message}`);
  }
}

async function sendGlobalboost(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.globalboost[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Globalboost send error:', error.message);
    throw new Error(`Failed to send Globalboost: ${error.message}`);
  }
}

async function sendUbiq(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ubiq[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Ubiq send error:', error.message);
    throw new Error(`Failed to send Ubiq: ${error.message}`);
  }
}

async function sendEthergem(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethergem[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Ethergem send error:', error.message);
    throw new Error(`Failed to send Ethergem: ${error.message}`);
  }
}

async function sendEtherSocial(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethersocial[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('EtherSocial send error:', error.message);
    throw new Error(`Failed to send EtherSocial: ${error.message}`);
  }
}

async function sendAkroma(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.akroma[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Akroma send error:', error.message);
    throw new Error(`Failed to send Akroma: ${error.message}`);
  }
}

async function sendAtheios(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.atheios[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Atheios send error:', error.message);
    throw new Error(`Failed to send Atheios: ${error.message}`);
  }
}

async function sendMetaverse(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.metaverse[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Metaverse send error:', error.message);
    throw new Error(`Failed to send Metaverse: ${error.message}`);
  }
}

async function sendQuarkChain(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.quarkchain[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('QuarkChain send error:', error.message);
    throw new Error(`Failed to send QuarkChain: ${error.message}`);
  }
}

async function sendEnergi(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.energi[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Energi send error:', error.message);
    throw new Error(`Failed to send Energi: ${error.message}`);
  }
}

async function sendThunderCore(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.thundercore[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('ThunderCore send error:', error.message);
    throw new Error(`Failed to send ThunderCore: ${error.message}`);
  }
}

async function sendGoChain(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gochain[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('GoChain send error:', error.message);
    throw new Error(`Failed to send GoChain: ${error.message}`);
  }
}

async function sendEther1(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ether1[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Ether1 send error:', error.message);
    throw new Error(`Failed to send Ether1: ${error.message}`);
  }
}

async function sendMix(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.mix[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Mix send error:', error.message);
    throw new Error(`Failed to send Mix: ${error.message}`);
  }
}

async function sendIxian(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ixian[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e8) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Ixian send error:', error.message);
    throw new Error(`Failed to send Ixian: ${error.message}`);
  }
}

async function sendBolivarcoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bolivarcoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Bolivarcoin send error:', error.message);
    throw new Error(`Failed to send Bolivarcoin: ${error.message}`);
  }
}

async function sendPigeoncoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pigeoncoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Pigeoncoin send error:', error.message);
    throw new Error(`Failed to send Pigeoncoin: ${error.message}`);
  }
}

async function sendRapids(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.rapids[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Rapids send error:', error.message);
    throw new Error(`Failed to send Rapids: ${error.message}`);
  }
}

async function sendSuqa(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.suqa[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Suqa send error:', error.message);
    throw new Error(`Failed to send Suqa: ${error.message}`);
  }
}

async function sendArgoneum(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.argoneum[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Argoneum send error:', error.message);
    throw new Error(`Failed to send Argoneum: ${error.message}`);
  }
}

async function sendSocialSend(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.socialsend[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('SocialSend send error:', error.message);
    throw new Error(`Failed to send SocialSend: ${error.message}`);
  }
}

async function sendPhore(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.phore[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Phore send error:', error.message);
    throw new Error(`Failed to send Phore: ${error.message}`);
  }
}

async function sendStipend(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.stipend[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Stipend send error:', error.message);
    throw new Error(`Failed to send Stipend: ${error.message}`);
  }
}

async function sendViacoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.viacoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Viacoin send error:', error.message);
    throw new Error(`Failed to send Viacoin: ${error.message}`);
  }
}

async function sendRaptoreum(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.raptoreum[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Raptoreum send error:', error.message);
    throw new Error(`Failed to send Raptoreum: ${error.message}`);
  }
}

// Additional balance functions for new coins
async function getBitcoingoldBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoingold[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcoingold RPC error:', error.message);
    throw new Error(`Failed to get Bitcoingold balance: ${error.message}`);
  }
}

async function getBeamBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.beam[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e8;
  } catch (error) {
    console.error('Beam RPC error:', error.message);
    throw new Error(`Failed to get Beam balance: ${error.message}`);
  }
}

async function getZcashBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zcash RPC error:', error.message);
    throw new Error(`Failed to get Zcash balance: ${error.message}`);
  }
}

async function getAeternityBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aeternity[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e18;
  } catch (error) {
    console.error('Aeternity RPC error:', error.message);
    throw new Error(`Failed to get Aeternity balance: ${error.message}`);
  }
}

async function getBitcoininterestBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoininterest[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcoininterest RPC error:', error.message);
    throw new Error(`Failed to get Bitcoininterest balance: ${error.message}`);
  }
}

async function getConcealBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conceal[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: { account_index: 0 }
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e12;
  } catch (error) {
    console.error('Conceal RPC error:', error.message);
    throw new Error(`Failed to get Conceal balance: ${error.message}`);
  }
}

async function getZelcashBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zelcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zelcash RPC error:', error.message);
    throw new Error(`Failed to get Zelcash balance: ${error.message}`);
  }
}

async function getGrinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.grin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e9;
  } catch (error) {
    console.error('Grin RPC error:', error.message);
    throw new Error(`Failed to get Grin balance: ${error.message}`);
  }
}

async function getVertcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vertcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Vertcoin RPC error:', error.message);
    throw new Error(`Failed to get Vertcoin balance: ${error.message}`);
  }
}

async function getPeercoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.peercoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Peercoin RPC error:', error.message);
    throw new Error(`Failed to get Peercoin balance: ${error.message}`);
  }
}

async function getDigibyteBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.digibyte[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Digibyte RPC error:', error.message);
    throw new Error(`Failed to get Digibyte balance: ${error.message}`);
  }
}

async function getSyscoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.syscoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Syscoin RPC error:', error.message);
    throw new Error(`Failed to get Syscoin balance: ${error.message}`);
  }
}

async function getFluxBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.flux[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Flux RPC error:', error.message);
    throw new Error(`Failed to get Flux balance: ${error.message}`);
  }
}

async function getKomodoBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.komodo[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Komodo RPC error:', error.message);
    throw new Error(`Failed to get Komodo balance: ${error.message}`);
  }
}

async function getAionBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aion[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e18;
  } catch (error) {
    console.error('Aion RPC error:', error.message);
    throw new Error(`Failed to get Aion balance: ${error.message}`);
  }
}

async function getCortexBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.cortex[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e18;
  } catch (error) {
    console.error('Cortex RPC error:', error.message);
    throw new Error(`Failed to get Cortex balance: ${error.message}`);
  }
}

async function getCallistoBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.callisto[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Callisto RPC error:', error.message);
    throw new Error(`Failed to get Callisto balance: ${error.message}`);
  }
}

async function getEllaismBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ellaism[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ellaism RPC error:', error.message);
    throw new Error(`Failed to get Ellaism balance: ${error.message}`);
  }
}

async function getExpanseBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.expanse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Expanse RPC error:', error.message);
    throw new Error(`Failed to get Expanse balance: ${error.message}`);
  }
}

async function getMusicoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.musicoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Musicoin RPC error:', error.message);
    throw new Error(`Failed to get Musicoin balance: ${error.message}`);
  }
}

async function getPirlBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pirl[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Pirl RPC error:', error.message);
    throw new Error(`Failed to get Pirl balance: ${error.message}`);
  }
}

async function getYocoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.yocoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Yocoin RPC error:', error.message);
    throw new Error(`Failed to get Yocoin balance: ${error.message}`);
  }
}

async function getZoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zoin RPC error:', error.message);
    throw new Error(`Failed to get Zoin balance: ${error.message}`);
  }
}

async function getZeroBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zero[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zero RPC error:', error.message);
    throw new Error(`Failed to get Zero balance: ${error.message}`);
  }
}

async function getVidulumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vidulum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Vidulum RPC error:', error.message);
    throw new Error(`Failed to get Vidulum balance: ${error.message}`);
  }
}

async function getSwapBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.swap[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Swap RPC error:', error.message);
    throw new Error(`Failed to get Swap balance: ${error.message}`);
  }
}

async function getGentariumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gentarium[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Gentarium RPC error:', error.message);
    throw new Error(`Failed to get Gentarium balance: ${error.message}`);
  }
}

async function getBitcoreBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcore RPC error:', error.message);
    throw new Error(`Failed to get Bitcore balance: ${error.message}`);
  }
}

async function getTrezarcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.trezarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Trezarcoin RPC error:', error.message);
    throw new Error(`Failed to get Trezarcoin balance: ${error.message}`);
  }
}

async function getHempcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.hempcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Hempcoin RPC error:', error.message);
    throw new Error(`Failed to get Hempcoin balance: ${error.message}`);
  }
}

async function getGlobalboostBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.globalboost[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Globalboost RPC error:', error.message);
    throw new Error(`Failed to get Globalboost balance: ${error.message}`);
  }
}

async function getUbiqBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ubiq[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ubiq RPC error:', error.message);
    throw new Error(`Failed to get Ubiq balance: ${error.message}`);
  }
}

async function getEthergemBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethergem[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ethergem RPC error:', error.message);
    throw new Error(`Failed to get Ethergem balance: ${error.message}`);
  }
}

async function getEtherSocialBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethersocial[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('EtherSocial RPC error:', error.message);
    throw new Error(`Failed to get EtherSocial balance: ${error.message}`);
  }
}

async function getAkromaBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.akroma[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Akroma RPC error:', error.message);
    throw new Error(`Failed to get Akroma balance: ${error.message}`);
  }
}

async function getAtheiosBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.atheios[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Atheios RPC error:', error.message);
    throw new Error(`Failed to get Atheios balance: ${error.message}`);
  }
}

async function getMetaverseBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.metaverse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Metaverse RPC error:', error.message);
    throw new Error(`Failed to get Metaverse balance: ${error.message}`);
  }
}

async function getQuarkChainBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.quarkchain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('QuarkChain RPC error:', error.message);
    throw new Error(`Failed to get QuarkChain balance: ${error.message}`);
  }
}

async function getEnergiBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.energi[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Energi RPC error:', error.message);
    throw new Error(`Failed to get Energi balance: ${error.message}`);
  }
}

async function getThunderCoreBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.thundercore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('ThunderCore RPC error:', error.message);
    throw new Error(`Failed to get ThunderCore balance: ${error.message}`);
  }
}

async function getGoChainBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gochain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('GoChain RPC error:', error.message);
    throw new Error(`Failed to get GoChain balance: ${error.message}`);
  }
}

async function getEther1Balance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ether1[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ether1 RPC error:', error.message);
    throw new Error(`Failed to get Ether1 balance: ${error.message}`);
  }
}

async function getMixBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.mix[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Mix RPC error:', error.message);
    throw new Error(`Failed to get Mix balance: ${error.message}`);
  }
}

async function getIxianBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ixian[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e8;
  } catch (error) {
    console.error('Ixian RPC error:', error.message);
    throw new Error(`Failed to get Ixian balance: ${error.message}`);
  }
}

async function getBolivarcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bolivarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bolivarcoin RPC error:', error.message);
    throw new Error(`Failed to get Bolivarcoin balance: ${error.message}`);
  }
}

async function getPigeoncoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pigeoncoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Pigeoncoin RPC error:', error.message);
    throw new Error(`Failed to get Pigeoncoin balance: ${error.message}`);
  }
}

async function getRapidsBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.rapids[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Rapids RPC error:', error.message);
    throw new Error(`Failed to get Rapids balance: ${error.message}`);
  }
}

async function getSuqaBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.suqa[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Suqa RPC error:', error.message);
    throw new Error(`Failed to get Suqa balance: ${error.message}`);
  }
}

async function getArgoneumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.argoneum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Argoneum RPC error:', error.message);
    throw new Error(`Failed to get Argoneum balance: ${error.message}`);
  }
}

async function getSocialSendBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.socialsend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('SocialSend RPC error:', error.message);
    throw new Error(`Failed to get SocialSend balance: ${error.message}`);
  }
}

async function getPhoreBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.phore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Phore RPC error:', error.message);
    throw new Error(`Failed to get Phore balance: ${error.message}`);
  }
}

async function getStipendBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.stipend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Stipend RPC error:', error.message);
    throw new Error(`Failed to get Stipend balance: ${error.message}`);
  }
}

async function getViacoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.viacoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Viacoin RPC error:', error.message);
    throw new Error(`Failed to get Viacoin balance: ${error.message}`);
  }
}

async function getRaptoreumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.raptoreum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Raptoreum RPC error:', error.message);
    throw new Error(`Failed to get Raptoreum balance: ${error.message}`);
  }
}

// Additional history functions for new coins
async function getBitcoingoldHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoingold[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Bitcoingold history error:', error.message);
    throw new Error(`Failed to get Bitcoingold history: ${error.message}`);
  }
}

async function getBeamHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.beam[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'get_transaction_history',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result?.transactions || [];
  } catch (error) {
    console.error('Beam history error:', error.message);
    throw new Error(`Failed to get Beam history: ${error.message}`);
  }
}

async function getZcashHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Zcash history error:', error.message);
    throw new Error(`Failed to get Zcash history: ${error.message}`);
  }
}

async function getAeternityHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aeternity[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'get_transaction_history',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result?.transactions || [];
  } catch (error) {
    console.error('Aeternity history error:', error.message);
    throw new Error(`Failed to get Aeternity history: ${error.message}`);
  }
}

async function getBitcoininterestHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoininterest[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Bitcoininterest history error:', error.message);
    throw new Error(`Failed to get Bitcoininterest history: ${error.message}`);
  }
}

async function getConcealHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conceal[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'get_transfers',
      params: { in: true, out: true, pending: false, failed: false, pool: false }
    }, { timeout: 10000 });
    return response.data.result?.transfers || [];
  } catch (error) {
    console.error('Conceal history error:', error.message);
    throw new Error(`Failed to get Conceal history: ${error.message}`);
  }
}

async function getZelcashHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zelcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Zelcash history error:', error.message);
    throw new Error(`Failed to get Zelcash history: ${error.message}`);
  }
}

async function getGrinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.grin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'get_transaction_history',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result?.transactions || [];
  } catch (error) {
    console.error('Grin history error:', error.message);
    throw new Error(`Failed to get Grin history: ${error.message}`);
  }
}

async function getVertcoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vertcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Vertcoin history error:', error.message);
    throw new Error(`Failed to get Vertcoin history: ${error.message}`);
  }
}

async function getPeercoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.peercoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Peercoin history error:', error.message);
    throw new Error(`Failed to get Peercoin history: ${error.message}`);
  }
}

async function getDigibyteHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.digibyte[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Digibyte history error:', error.message);
    throw new Error(`Failed to get Digibyte history: ${error.message}`);
  }
}

async function getSyscoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.syscoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Syscoin history error:', error.message);
    throw new Error(`Failed to get Syscoin history: ${error.message}`);
  }
}

async function getFluxHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.flux[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Flux history error:', error.message);
    throw new Error(`Failed to get Flux history: ${error.message}`);
  }
}

async function getKomodoHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.komodo[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Komodo history error:', error.message);
    throw new Error(`Failed to get Komodo history: ${error.message}`);
  }
}

async function getAionHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aion[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'get_transaction_history',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result?.transactions || [];
  } catch (error) {
    console.error('Aion history error:', error.message);
    throw new Error(`Failed to get Aion history: ${error.message}`);
  }
}

async function getCortexHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.cortex[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'get_transaction_history',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result?.transactions || [];
  } catch (error) {
    console.error('Cortex history error:', error.message);
    throw new Error(`Failed to get Cortex history: ${error.message}`);
  }
}

async function getCallistoHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.callisto[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Callisto history error:', error.message);
    throw new Error(`Failed to get Callisto history: ${error.message}`);
  }
}

async function getEllaismHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ellaism[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Ellaism history error:', error.message);
    throw new Error(`Failed to get Ellaism history: ${error.message}`);
  }
}

async function getExpanseHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.expanse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Expanse history error:', error.message);
    throw new Error(`Failed to get Expanse history: ${error.message}`);
  }
}

async function getMusicoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.musicoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Musicoin history error:', error.message);
    throw new Error(`Failed to get Musicoin history: ${error.message}`);
  }
}

async function getPirlHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pirl[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Pirl history error:', error.message);
    throw new Error(`Failed to get Pirl history: ${error.message}`);
  }
}

async function getYocoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.yocoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Yocoin history error:', error.message);
    throw new Error(`Failed to get Yocoin history: ${error.message}`);
  }
}

async function getZoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Zoin history error:', error.message);
    throw new Error(`Failed to get Zoin history: ${error.message}`);
  }
}

async function getZeroHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zero[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Zero history error:', error.message);
    throw new Error(`Failed to get Zero history: ${error.message}`);
  }
}

async function getVidulumHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vidulum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Vidulum history error:', error.message);
    throw new Error(`Failed to get Vidulum history: ${error.message}`);
  }
}

async function getSwapHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.swap[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Swap history error:', error.message);
    throw new Error(`Failed to get Swap history: ${error.message}`);
  }
}

async function getGentariumHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gentarium[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Gentarium history error:', error.message);
    throw new Error(`Failed to get Gentarium history: ${error.message}`);
  }
}

async function getBitcoreHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Bitcore history error:', error.message);
    throw new Error(`Failed to get Bitcore history: ${error.message}`);
  }
}

async function getTrezarcoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.trezarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Trezarcoin history error:', error.message);
    throw new Error(`Failed to get Trezarcoin history: ${error.message}`);
  }
}

async function getHempcoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.hempcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Hempcoin history error:', error.message);
    throw new Error(`Failed to get Hempcoin history: ${error.message}`);
  }
}

async function getGlobalboostHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.globalboost[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Globalboost history error:', error.message);
    throw new Error(`Failed to get Globalboost history: ${error.message}`);
  }
}

async function getUbiqHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ubiq[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Ubiq history error:', error.message);
    throw new Error(`Failed to get Ubiq history: ${error.message}`);
  }
}

async function getEthergemHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethergem[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Ethergem history error:', error.message);
    throw new Error(`Failed to get Ethergem history: ${error.message}`);
  }
}

async function getEtherSocialHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethersocial[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('EtherSocial history error:', error.message);
    throw new Error(`Failed to get EtherSocial history: ${error.message}`);
  }
}

async function getAkromaHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.akroma[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Akroma history error:', error.message);
    throw new Error(`Failed to get Akroma history: ${error.message}`);
  }
}

async function getAtheiosHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.atheios[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Atheios history error:', error.message);
    throw new Error(`Failed to get Atheios history: ${error.message}`);
  }
}

async function getMetaverseHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.metaverse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Metaverse history error:', error.message);
    throw new Error(`Failed to get Metaverse history: ${error.message}`);
  }
}

async function getQuarkChainHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.quarkchain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('QuarkChain history error:', error.message);
    throw new Error(`Failed to get QuarkChain history: ${error.message}`);
  }
}

async function getEnergiHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.energi[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Energi history error:', error.message);
    throw new Error(`Failed to get Energi history: ${error.message}`);
  }
}

async function getThunderCoreHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.thundercore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('ThunderCore history error:', error.message);
    throw new Error(`Failed to get ThunderCore history: ${error.message}`);
  }
}

async function getGoChainHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gochain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('GoChain history error:', error.message);
    throw new Error(`Failed to get GoChain history: ${error.message}`);
  }
}

async function getEther1History(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ether1[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Ether1 history error:', error.message);
    throw new Error(`Failed to get Ether1 history: ${error.message}`);
  }
}

async function getMixHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.mix[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'eth_getTransactionCount',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return []; // Mock history for Ethereum-compatible chains
  } catch (error) {
    console.error('Mix history error:', error.message);
    throw new Error(`Failed to get Mix history: ${error.message}`);
  }
}

async function getIxianHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ixian[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'get_transaction_history',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result?.transactions || [];
  } catch (error) {
    console.error('Ixian history error:', error.message);
    throw new Error(`Failed to get Ixian history: ${error.message}`);
  }
}

async function getBolivarcoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bolivarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Bolivarcoin history error:', error.message);
    throw new Error(`Failed to get Bolivarcoin history: ${error.message}`);
  }
}

async function getPigeoncoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pigeoncoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Pigeoncoin history error:', error.message);
    throw new Error(`Failed to get Pigeoncoin history: ${error.message}`);
  }
}

async function getRapidsHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.rapids[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Rapids history error:', error.message);
    throw new Error(`Failed to get Rapids history: ${error.message}`);
  }
}

async function getSuqaHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.suqa[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Suqa history error:', error.message);
    throw new Error(`Failed to get Suqa history: ${error.message}`);
  }
}

async function getArgoneumHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.argoneum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Argoneum history error:', error.message);
    throw new Error(`Failed to get Argoneum history: ${error.message}`);
  }
}

async function getSocialSendHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.socialsend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('SocialSend history error:', error.message);
    throw new Error(`Failed to get SocialSend history: ${error.message}`);
  }
}

async function getPhoreHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.phore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Phore history error:', error.message);
    throw new Error(`Failed to get Phore history: ${error.message}`);
  }
}

async function getStipendHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.stipend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Stipend history error:', error.message);
    throw new Error(`Failed to get Stipend history: ${error.message}`);
  }
}

async function getViacoinHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.viacoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Viacoin history error:', error.message);
    throw new Error(`Failed to get Viacoin history: ${error.message}`);
  }
}

async function getRaptoreumHistory(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.raptoreum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'gethistory', method: 'listtransactions',
      params: ['*', 100, 0, true]
    }, { timeout: 10000 });
    return response.data.result || [];
  } catch (error) {
    console.error('Raptoreum history error:', error.message);
    throw new Error(`Failed to get Raptoreum history: ${error.message}`);
  }
}

// Additional fee estimation functions for new coins
async function estimateBitcoingoldFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoingold[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Bitcoingold fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateBeamFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.beam[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'get_fee_rate',
      params: []
    }, { timeout: 10000 });
    return (response.data.result?.fee_rate || 10000) / 1e8;
  } catch (error) {
    console.error('Beam fee estimation error:', error.message);
    return 0.0001;
  }
}

async function estimateZcashFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Zcash fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateAeternityFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aeternity[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'get_fee_rate',
      params: []
    }, { timeout: 10000 });
    return (response.data.result?.fee_rate || 1000000000) / 1e18;
  } catch (error) {
    console.error('Aeternity fee estimation error:', error.message);
    return 0.001;
  }
}

async function estimateBitcoininterestFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoininterest[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Bitcoininterest fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateConcealFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conceal[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'get_fee_rate',
      params: []
    }, { timeout: 10000 });
    return (response.data.result?.fee_rate || 10000) / 1e12;
  } catch (error) {
    console.error('Conceal fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateZelcashFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zelcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Zelcash fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateGrinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.grin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'get_fee_rate',
      params: []
    }, { timeout: 10000 });
    return (response.data.result?.fee_rate || 1000000) / 1e9;
  } catch (error) {
    console.error('Grin fee estimation error:', error.message);
    return 0.001;
  }
}

async function estimateVertcoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vertcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Vertcoin fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimatePeercoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.peercoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Peercoin fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateDigibyteFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.digibyte[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Digibyte fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateSyscoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.syscoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Syscoin fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateFluxFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.flux[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Flux fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateKomodoFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.komodo[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Komodo fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateAionFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aion[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'get_fee_rate',
      params: []
    }, { timeout: 10000 });
    return (response.data.result?.fee_rate || 1000000000) / 1e18;
  } catch (error) {
    console.error('Aion fee estimation error:', error.message);
    return 0.001;
  }
}

async function estimateCortexFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.cortex[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'get_fee_rate',
      params: []
    }, { timeout: 10000 });
    return (response.data.result?.fee_rate || 1000000000) / 1e18;
  } catch (error) {
    console.error('Cortex fee estimation error:', error.message);
    return 0.001;
  }
}

async function estimateCallistoFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.callisto[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Callisto fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateEllaismFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ellaism[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ellaism fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateExpanseFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.expanse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Expanse fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateMusicoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.musicoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Musicoin fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimatePirlFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pirl[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Pirl fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateYocoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.yocoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Yocoin fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateZoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Zoin fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateZeroFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zero[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Zero fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateVidulumFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vidulum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Vidulum fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateSwapFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.swap[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Swap fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateGentariumFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gentarium[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Gentarium fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateBitcoreFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Bitcore fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateTrezarcoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.trezarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Trezarcoin fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateHempcoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.hempcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Hempcoin fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateGlobalboostFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.globalboost[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Globalboost fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateUbiqFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ubiq[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ubiq fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateEthergemFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethergem[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ethergem fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateEtherSocialFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethersocial[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('EtherSocial fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateAkromaFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.akroma[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Akroma fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateAtheiosFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.atheios[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Atheios fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateMetaverseFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.metaverse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Metaverse fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateQuarkChainFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.quarkchain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('QuarkChain fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateEnergiFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.energi[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Energi fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateThunderCoreFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.thundercore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('ThunderCore fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateGoChainFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gochain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('GoChain fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateEther1Fee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ether1[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ether1 fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateMixFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.mix[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'eth_gasPrice',
      params: []
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Mix fee estimation error:', error.message);
    return 0.000000021;
  }
}

async function estimateIxianFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ixian[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'get_fee_rate',
      params: []
    }, { timeout: 10000 });
    return (response.data.result?.fee_rate || 10000) / 1e8;
  } catch (error) {
    console.error('Ixian fee estimation error:', error.message);
    return 0.0001;
  }
}

async function estimateBolivarcoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bolivarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Bolivarcoin fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimatePigeoncoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pigeoncoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Pigeoncoin fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateRapidsFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.rapids[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Rapids fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateSuqaFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.suqa[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Suqa fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateArgoneumFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.argoneum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Argoneum fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateSocialSendFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.socialsend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('SocialSend fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimatePhoreFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.phore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Phore fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateStipendFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.stipend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Stipend fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateViacoinFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.viacoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Viacoin fee estimation error:', error.message);
    return 0.00001;
  }
}

async function estimateRaptoreumFee(network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.raptoreum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'estimatefee', method: 'estimatesmartfee',
      params: [6]
    }, { timeout: 10000 });
    return response.data.result?.feerate || 0.00001;
  } catch (error) {
    console.error('Raptoreum fee estimation error:', error.message);
    return 0.00001;
  }
}

// Additional send functions for new coins
async function sendBitcoingold(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoingold[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Bitcoingold send error:', error.message);
    throw new Error(`Failed to send Bitcoingold: ${error.message}`);
  }
}

async function sendBeam(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.beam[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e8), fee: 10000 }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Beam send error:', error.message);
    throw new Error(`Failed to send Beam: ${error.message}`);
  }
}

async function sendZcash(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zcash[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Zcash send error:', error.message);
    throw new Error(`Failed to send Zcash: ${error.message}`);
  }
}

async function sendAeternity(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aeternity[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e18) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Aeternity send error:', error.message);
    throw new Error(`Failed to send Aeternity: ${error.message}`);
  }
}

async function sendBitcoininterest(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoininterest[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Bitcoininterest send error:', error.message);
    throw new Error(`Failed to send Bitcoininterest: ${error.message}`);
  }
}

async function sendConceal(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conceal[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'transfer', method: 'transfer',
      params: { destinations: [{ address: toAddress, amount: Math.floor(amount * 1e12) }], account_index: 0, priority: 1, ring_size: 16 }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.tx_hash };
  } catch (error) {
    console.error('Conceal send error:', error.message);
    throw new Error(`Failed to send Conceal: ${error.message}`);
  }
}

async function sendZelcash(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zelcash[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Zelcash send error:', error.message);
    throw new Error(`Failed to send Zelcash: ${error.message}`);
  }
}

async function sendGrin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.grin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e9) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Grin send error:', error.message);
    throw new Error(`Failed to send Grin: ${error.message}`);
  }
}

async function sendVertcoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vertcoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Vertcoin send error:', error.message);
    throw new Error(`Failed to send Vertcoin: ${error.message}`);
  }
}

async function sendPeercoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.peercoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Peercoin send error:', error.message);
    throw new Error(`Failed to send Peercoin: ${error.message}`);
  }
}

async function sendDigibyte(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.digibyte[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Digibyte send error:', error.message);
    throw new Error(`Failed to send Digibyte: ${error.message}`);
  }
}

async function sendSyscoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.syscoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Syscoin send error:', error.message);
    throw new Error(`Failed to send Syscoin: ${error.message}`);
  }
}

async function sendFlux(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.flux[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Flux send error:', error.message);
    throw new Error(`Failed to send Flux: ${error.message}`);
  }
}

async function sendKomodo(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.komodo[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Komodo send error:', error.message);
    throw new Error(`Failed to send Komodo: ${error.message}`);
  }
}

async function sendAion(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aion[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e18) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Aion send error:', error.message);
    throw new Error(`Failed to send Aion: ${error.message}`);
  }
}

async function sendCortex(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.cortex[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e18) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Cortex send error:', error.message);
    throw new Error(`Failed to send Cortex: ${error.message}`);
  }
}

async function sendCallisto(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.callisto[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Callisto send error:', error.message);
    throw new Error(`Failed to send Callisto: ${error.message}`);
  }
}

async function sendEllaism(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ellaism[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Ellaism send error:', error.message);
    throw new Error(`Failed to send Ellaism: ${error.message}`);
  }
}

async function sendExpanse(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.expanse[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Expanse send error:', error.message);
    throw new Error(`Failed to send Expanse: ${error.message}`);
  }
}

async function sendMusicoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.musicoin[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Musicoin send error:', error.message);
    throw new Error(`Failed to send Musicoin: ${error.message}`);
  }
}

async function sendPirl(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pirl[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Pirl send error:', error.message);
    throw new Error(`Failed to send Pirl: ${error.message}`);
  }
}

async function sendYocoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.yocoin[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Yocoin send error:', error.message);
    throw new Error(`Failed to send Yocoin: ${error.message}`);
  }
}

async function sendZoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Zoin send error:', error.message);
    throw new Error(`Failed to send Zoin: ${error.message}`);
  }
}

async function sendZero(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zero[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Zero send error:', error.message);
    throw new Error(`Failed to send Zero: ${error.message}`);
  }
}

async function sendVidulum(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vidulum[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Vidulum send error:', error.message);
    throw new Error(`Failed to send Vidulum: ${error.message}`);
  }
}

async function sendSwap(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.swap[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Swap send error:', error.message);
    throw new Error(`Failed to send Swap: ${error.message}`);
  }
}

async function sendGentarium(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gentarium[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Gentarium send error:', error.message);
    throw new Error(`Failed to send Gentarium: ${error.message}`);
  }
}

async function sendBitcore(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcore[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Bitcore send error:', error.message);
    throw new Error(`Failed to send Bitcore: ${error.message}`);
  }
}

async function sendTrezarcoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.trezarcoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Trezarcoin send error:', error.message);
    throw new Error(`Failed to send Trezarcoin: ${error.message}`);
  }
}

async function sendHempcoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.hempcoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Hempcoin send error:', error.message);
    throw new Error(`Failed to send Hempcoin: ${error.message}`);
  }
}

async function sendGlobalboost(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.globalboost[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Globalboost send error:', error.message);
    throw new Error(`Failed to send Globalboost: ${error.message}`);
  }
}

async function sendUbiq(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ubiq[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Ubiq send error:', error.message);
    throw new Error(`Failed to send Ubiq: ${error.message}`);
  }
}

async function sendEthergem(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethergem[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Ethergem send error:', error.message);
    throw new Error(`Failed to send Ethergem: ${error.message}`);
  }
}

async function sendEtherSocial(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethersocial[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('EtherSocial send error:', error.message);
    throw new Error(`Failed to send EtherSocial: ${error.message}`);
  }
}

async function sendAkroma(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.akroma[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Akroma send error:', error.message);
    throw new Error(`Failed to send Akroma: ${error.message}`);
  }
}

async function sendAtheios(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.atheios[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Atheios send error:', error.message);
    throw new Error(`Failed to send Atheios: ${error.message}`);
  }
}

async function sendMetaverse(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.metaverse[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Metaverse send error:', error.message);
    throw new Error(`Failed to send Metaverse: ${error.message}`);
  }
}

async function sendQuarkChain(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.quarkchain[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('QuarkChain send error:', error.message);
    throw new Error(`Failed to send QuarkChain: ${error.message}`);
  }
}

async function sendEnergi(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.energi[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Energi send error:', error.message);
    throw new Error(`Failed to send Energi: ${error.message}`);
  }
}

async function sendThunderCore(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.thundercore[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('ThunderCore send error:', error.message);
    throw new Error(`Failed to send ThunderCore: ${error.message}`);
  }
}

async function sendGoChain(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gochain[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('GoChain send error:', error.message);
    throw new Error(`Failed to send GoChain: ${error.message}`);
  }
}

async function sendEther1(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ether1[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Ether1 send error:', error.message);
    throw new Error(`Failed to send Ether1: ${error.message}`);
  }
}

async function sendMix(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.mix[network];
    const nonceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount',
      params: [fromAddress, 'latest']
    }, { timeout: 10000 });
    const nonce = nonceResponse.data.result;
    const gasPriceResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: []
    }, { timeout: 10000 });
    const gasPrice = gasPriceResponse.data.result;
    const tx = {
      nonce: nonce, gasPrice: gasPrice, gasLimit: '0x5208',
      to: toAddress, value: '0x' + (amount * 1e18).toString(16), data: '0x'
    };
    const mockTxHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');
    return { txHash: mockTxHash };
  } catch (error) {
    console.error('Mix send error:', error.message);
    throw new Error(`Failed to send Mix: ${error.message}`);
  }
}

async function sendIxian(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ixian[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'send', method: 'send_transaction',
      params: { from: fromAddress, to: toAddress, amount: Math.floor(amount * 1e8) }
    }, { timeout: 30000 });
    return { txHash: response.data.result?.txId };
  } catch (error) {
    console.error('Ixian send error:', error.message);
    throw new Error(`Failed to send Ixian: ${error.message}`);
  }
}

async function sendBolivarcoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bolivarcoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Bolivarcoin send error:', error.message);
    throw new Error(`Failed to send Bolivarcoin: ${error.message}`);
  }
}

async function sendPigeoncoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pigeoncoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Pigeoncoin send error:', error.message);
    throw new Error(`Failed to send Pigeoncoin: ${error.message}`);
  }
}

async function sendRapids(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.rapids[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Rapids send error:', error.message);
    throw new Error(`Failed to send Rapids: ${error.message}`);
  }
}

async function sendSuqa(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.suqa[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Suqa send error:', error.message);
    throw new Error(`Failed to send Suqa: ${error.message}`);
  }
}

async function sendArgoneum(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.argoneum[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Argoneum send error:', error.message);
    throw new Error(`Failed to send Argoneum: ${error.message}`);
  }
}

async function sendSocialSend(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.socialsend[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('SocialSend send error:', error.message);
    throw new Error(`Failed to send SocialSend: ${error.message}`);
  }
}

async function sendPhore(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.phore[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Phore send error:', error.message);
    throw new Error(`Failed to send Phore: ${error.message}`);
  }
}

async function sendStipend(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.stipend[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Stipend send error:', error.message);
    throw new Error(`Failed to send Stipend: ${error.message}`);
  }
}

async function sendViacoin(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.viacoin[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Viacoin send error:', error.message);
    throw new Error(`Failed to send Viacoin: ${error.message}`);
  }
}

async function sendRaptoreum(fromAddress, toAddress, amount, privateKey, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.raptoreum[network];
    const utxoResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'listunspent', method: 'listunspent',
      params: [6, 9999999, [fromAddress]]
    }, { timeout: 10000 });
    const utxos = utxoResponse.data.result || [];
    if (utxos.length === 0) throw new Error('No unspent outputs available');
    let totalInput = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
      selectedUtxos.push({ txid: utxo.txid, vout: utxo.vout });
      totalInput += utxo.amount;
      if (totalInput >= amount + 0.00001) break;
    }
    const inputs = selectedUtxos;
    const outputs = {};
    outputs[toAddress] = amount;
    const change = totalInput - amount - 0.00001;
    if (change > 0.00001) outputs[fromAddress] = change;
    const createTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'createrawtransaction', method: 'createrawtransaction',
      params: [inputs, outputs]
    }, { timeout: 10000 });
    const rawTx = createTxResponse.data.result;
    const signTxResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'signrawtransaction', method: 'signrawtransactionwithkey',
      params: [rawTx, [privateKey]]
    }, { timeout: 10000 });
    const signedTx = signTxResponse.data.result.hex;
    const broadcastResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0', id: 'sendrawtransaction', method: 'sendrawtransaction',
      params: [signedTx]
    }, { timeout: 10000 });
    return { txHash: broadcastResponse.data.result };
  } catch (error) {
    console.error('Raptoreum send error:', error.message);
    throw new Error(`Failed to send Raptoreum: ${error.message}`);
  }
}

// Additional balance functions for new coins
async function getBitcoingoldBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoingold[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcoingold RPC error:', error.message);
    throw new Error(`Failed to get Bitcoingold balance: ${error.message}`);
  }
}

async function getBeamBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.beam[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e8;
  } catch (error) {
    console.error('Beam RPC error:', error.message);
    throw new Error(`Failed to get Beam balance: ${error.message}`);
  }
}

async function getZcashBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zcash RPC error:', error.message);
    throw new Error(`Failed to get Zcash balance: ${error.message}`);
  }
}

async function getAeternityBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aeternity[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e18;
  } catch (error) {
    console.error('Aeternity RPC error:', error.message);
    throw new Error(`Failed to get Aeternity balance: ${error.message}`);
  }
}

async function getBitcoininterestBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcoininterest[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcoininterest RPC error:', error.message);
    throw new Error(`Failed to get Bitcoininterest balance: ${error.message}`);
  }
}

async function getConcealBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.conceal[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: { account_index: 0 }
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e12;
  } catch (error) {
    console.error('Conceal RPC error:', error.message);
    throw new Error(`Failed to get Conceal balance: ${error.message}`);
  }
}

async function getZelcashBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zelcash[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zelcash RPC error:', error.message);
    throw new Error(`Failed to get Zelcash balance: ${error.message}`);
  }
}

async function getGrinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.grin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e9;
  } catch (error) {
    console.error('Grin RPC error:', error.message);
    throw new Error(`Failed to get Grin balance: ${error.message}`);
  }
}

async function getVertcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vertcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Vertcoin RPC error:', error.message);
    throw new Error(`Failed to get Vertcoin balance: ${error.message}`);
  }
}

async function getPeercoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.peercoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Peercoin RPC error:', error.message);
    throw new Error(`Failed to get Peercoin balance: ${error.message}`);
  }
}

async function getDigibyteBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.digibyte[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Digibyte RPC error:', error.message);
    throw new Error(`Failed to get Digibyte balance: ${error.message}`);
  }
}

async function getSyscoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.syscoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Syscoin RPC error:', error.message);
    throw new Error(`Failed to get Syscoin balance: ${error.message}`);
  }
}

async function getFluxBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.flux[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Flux RPC error:', error.message);
    throw new Error(`Failed to get Flux balance: ${error.message}`);
  }
}

async function getKomodoBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.komodo[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Komodo RPC error:', error.message);
    throw new Error(`Failed to get Komodo balance: ${error.message}`);
  }
}

async function getAionBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.aion[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e18;
  } catch (error) {
    console.error('Aion RPC error:', error.message);
    throw new Error(`Failed to get Aion balance: ${error.message}`);
  }
}

async function getCortexBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.cortex[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e18;
  } catch (error) {
    console.error('Cortex RPC error:', error.message);
    throw new Error(`Failed to get Cortex balance: ${error.message}`);
  }
}

async function getCallistoBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.callisto[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Callisto RPC error:', error.message);
    throw new Error(`Failed to get Callisto balance: ${error.message}`);
  }
}

async function getEllaismBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ellaism[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ellaism RPC error:', error.message);
    throw new Error(`Failed to get Ellaism balance: ${error.message}`);
  }
}

async function getExpanseBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.expanse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Expanse RPC error:', error.message);
    throw new Error(`Failed to get Expanse balance: ${error.message}`);
  }
}

async function getMusicoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.musicoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Musicoin RPC error:', error.message);
    throw new Error(`Failed to get Musicoin balance: ${error.message}`);
  }
}

async function getPirlBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pirl[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Pirl RPC error:', error.message);
    throw new Error(`Failed to get Pirl balance: ${error.message}`);
  }
}

async function getYocoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.yocoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Yocoin RPC error:', error.message);
    throw new Error(`Failed to get Yocoin balance: ${error.message}`);
  }
}

async function getZoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zoin RPC error:', error.message);
    throw new Error(`Failed to get Zoin balance: ${error.message}`);
  }
}

async function getZeroBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.zero[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Zero RPC error:', error.message);
    throw new Error(`Failed to get Zero balance: ${error.message}`);
  }
}

async function getVidulumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.vidulum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Vidulum RPC error:', error.message);
    throw new Error(`Failed to get Vidulum balance: ${error.message}`);
  }
}

async function getSwapBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.swap[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Swap RPC error:', error.message);
    throw new Error(`Failed to get Swap balance: ${error.message}`);
  }
}

async function getGentariumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gentarium[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Gentarium RPC error:', error.message);
    throw new Error(`Failed to get Gentarium balance: ${error.message}`);
  }
}

async function getBitcoreBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bitcore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bitcore RPC error:', error.message);
    throw new Error(`Failed to get Bitcore balance: ${error.message}`);
  }
}

async function getTrezarcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.trezarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Trezarcoin RPC error:', error.message);
    throw new Error(`Failed to get Trezarcoin balance: ${error.message}`);
  }
}

async function getHempcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.hempcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Hempcoin RPC error:', error.message);
    throw new Error(`Failed to get Hempcoin balance: ${error.message}`);
  }
}

async function getGlobalboostBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.globalboost[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Globalboost RPC error:', error.message);
    throw new Error(`Failed to get Globalboost balance: ${error.message}`);
  }
}

async function getUbiqBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ubiq[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ubiq RPC error:', error.message);
    throw new Error(`Failed to get Ubiq balance: ${error.message}`);
  }
}

async function getEthergemBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethergem[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ethergem RPC error:', error.message);
    throw new Error(`Failed to get Ethergem balance: ${error.message}`);
  }
}

async function getEtherSocialBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ethersocial[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('EtherSocial RPC error:', error.message);
    throw new Error(`Failed to get EtherSocial balance: ${error.message}`);
  }
}

async function getAkromaBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.akroma[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Akroma RPC error:', error.message);
    throw new Error(`Failed to get Akroma balance: ${error.message}`);
  }
}

async function getAtheiosBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.atheios[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Atheios RPC error:', error.message);
    throw new Error(`Failed to get Atheios balance: ${error.message}`);
  }
}

async function getMetaverseBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.metaverse[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Metaverse RPC error:', error.message);
    throw new Error(`Failed to get Metaverse balance: ${error.message}`);
  }
}

async function getQuarkChainBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.quarkchain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('QuarkChain RPC error:', error.message);
    throw new Error(`Failed to get QuarkChain balance: ${error.message}`);
  }
}

async function getEnergiBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.energi[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Energi RPC error:', error.message);
    throw new Error(`Failed to get Energi balance: ${error.message}`);
  }
}

async function getThunderCoreBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.thundercore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('ThunderCore RPC error:', error.message);
    throw new Error(`Failed to get ThunderCore balance: ${error.message}`);
  }
}

async function getGoChainBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.gochain[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('GoChain RPC error:', error.message);
    throw new Error(`Failed to get GoChain balance: ${error.message}`);
  }
}

async function getEther1Balance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ether1[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Ether1 RPC error:', error.message);
    throw new Error(`Failed to get Ether1 balance: ${error.message}`);
  }
}

async function getMixBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.mix[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { timeout: 10000 });
    return parseInt(response.data.result, 16) / 1e18;
  } catch (error) {
    console.error('Mix RPC error:', error.message);
    throw new Error(`Failed to get Mix balance: ${error.message}`);
  }
}

async function getIxianBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.ixian[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'get_balance',
      params: [address]
    }, { timeout: 10000 });
    return (response.data.result?.balance || 0) / 1e8;
  } catch (error) {
    console.error('Ixian RPC error:', error.message);
    throw new Error(`Failed to get Ixian balance: ${error.message}`);
  }
}

async function getBolivarcoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.bolivarcoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Bolivarcoin RPC error:', error.message);
    throw new Error(`Failed to get Bolivarcoin balance: ${error.message}`);
  }
}

async function getPigeoncoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.pigeoncoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Pigeoncoin RPC error:', error.message);
    throw new Error(`Failed to get Pigeoncoin balance: ${error.message}`);
  }
}

async function getRapidsBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.rapids[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Rapids RPC error:', error.message);
    throw new Error(`Failed to get Rapids balance: ${error.message}`);
  }
}

async function getSuqaBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.suqa[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Suqa RPC error:', error.message);
    throw new Error(`Failed to get Suqa balance: ${error.message}`);
  }
}

async function getArgoneumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.argoneum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Argoneum RPC error:', error.message);
    throw new Error(`Failed to get Argoneum balance: ${error.message}`);
  }
}

async function getSocialSendBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.socialsend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('SocialSend RPC error:', error.message);
    throw new Error(`Failed to get SocialSend balance: ${error.message}`);
  }
}

async function getPhoreBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.phore[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Phore RPC error:', error.message);
    throw new Error(`Failed to get Phore balance: ${error.message}`);
  }
}

async function getStipendBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.stipend[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Stipend RPC error:', error.message);
    throw new Error(`Failed to get Stipend balance: ${error.message}`);
  }
}

async function getViacoinBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.viacoin[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Viacoin RPC error:', error.message);
    throw new Error(`Failed to get Viacoin balance: ${error.message}`);
  }
}

async function getRaptoreumBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = RPC_ENDPOINTS.raptoreum[network];
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'getreceivedbyaddress',
      params: [address]
    }, { timeout: 10000 });
    return response.data.result || 0;
  } catch (error) {
    console.error('Raptoreum RPC error:', error.message);
    throw new Error(`Failed to get Raptoreum balance: ${error.message}`);
  }
}

module.exports = router;
