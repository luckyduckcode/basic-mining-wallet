const crypto = require('crypto');
const secp256k1 = require('secp256k1');

class EtherGemWallet {
  constructor(rootKey) {
    this.rootKey = rootKey;
    this.network = {
      chainId: 1987,
      messagePrefix: '\x19Ethereum Signed Message:\n',
    };
  }

  get address() {
    const publicKey = this.rootKey.publicKey;
    const address = crypto.createHash('sha256')
      .update(publicKey.slice(1)) // Remove the 04 prefix
      .digest()
      .slice(-20);

    return '0x' + address.toString('hex').toLowerCase();
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
      const cleanAddress = address.toLowerCase().replace('0x', '');
      return cleanAddress.length === 40 && /^[0-9a-f]+$/.test(cleanAddress);
    } catch (error) {
      return false;
    }
  }
}

module.exports = { EtherGemWallet };
