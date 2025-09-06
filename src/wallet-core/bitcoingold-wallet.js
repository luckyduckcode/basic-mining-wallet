const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const bs58 = require('bs58');

class BitcoinGoldWallet {
  constructor(rootKey) {
    this.rootKey = rootKey;
    this.network = {
      messagePrefix: '\x18Bitcoin Gold Signed Message:\n',
      bech32: 'btg',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x26,
      scriptHash: 0x17,
      wif: 0x80,
    };
  }

  get address() {
    const publicKey = this.rootKey.publicKey;
    const sha256 = crypto.createHash('sha256').update(publicKey).digest();
    const ripemd160 = crypto.createHash('ripemd160').update(sha256).digest();

    const versionedPayload = Buffer.concat([
      Buffer.from([this.network.pubKeyHash]),
      ripemd160
    ]);

    const checksum = crypto.createHash('sha256')
      .update(crypto.createHash('sha256').update(versionedPayload).digest())
      .digest()
      .slice(0, 4);

    const address = Buffer.concat([versionedPayload, checksum]);
    return bs58.encode(address);
  }

  get publicKey() {
    return this.rootKey.publicKey.toString('hex');
  }

  get privateKey() {
    return this.rootKey.privateKey.toString('hex');
  }

  signTransaction(txData) {
    const txHash = crypto.createHash('sha256')
      .update(JSON.stringify(txData))
      .digest();

    const signature = secp256k1.sign(txHash, this.rootKey.privateKey);
    return {
      signature: signature.signature.toString('hex'),
      recovery: signature.recovery,
      publicKey: this.publicKey
    };
  }

  verifyAddress(address) {
    try {
      const decoded = bs58.decode(address);
      const checksum = decoded.slice(-4);
      const payload = decoded.slice(0, -4);

      const calculatedChecksum = crypto.createHash('sha256')
        .update(crypto.createHash('sha256').update(payload).digest())
        .digest()
        .slice(0, 4);

      return checksum.equals(calculatedChecksum) && payload[0] === this.network.pubKeyHash;
    } catch (error) {
      return false;
    }
  }
}

module.exports = { BitcoinGoldWallet };
