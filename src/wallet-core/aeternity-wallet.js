const crypto = require('crypto');
const secp256k1 = require('secp256k1');

class AeternityWallet {
  constructor(rootKey) {
    this.rootKey = rootKey;
    this.network = {
      messagePrefix: '\x18Aeternity Signed Message:\n',
      bech32: 'ae',
      pubKeyHash: 0x01,
    };
  }

  get address() {
    const publicKey = this.rootKey.publicKey;
    const sha256 = crypto.createHash('sha256').update(publicKey).digest();

    // Aeternity uses a different address format
    const address = 'ak_' + Buffer.from(sha256.slice(0, 32)).toString('base64url');
    return address;
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
      if (!address.startsWith('ak_')) return false;

      const base64Part = address.slice(3);
      const decoded = Buffer.from(base64Part, 'base64url');

      return decoded.length === 32;
    } catch (error) {
      return false;
    }
  }
}

module.exports = { AeternityWallet };
