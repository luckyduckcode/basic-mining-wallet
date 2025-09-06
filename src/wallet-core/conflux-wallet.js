const crypto = require('crypto');
const keccak256 = require('keccak256');

class ConfluxWallet {
  constructor(hdKey) {
    this.hdKey = hdKey;
    this.publicKey = hdKey.publicKey;
    this.privateKey = hdKey.privateKey;
    this.address = this.generateAddress();
  }

  generateAddress() {
    // Conflux uses Ethereum-compatible addresses with 'cfx:' prefix
    const publicKeyHash = keccak256(this.publicKey.slice(1)); // Remove 0x04 prefix
    const address = 'cfx:' + publicKeyHash.slice(-20).toString('hex');

    return address;
  }

  signTransaction(txData) {
    const txHash = crypto.createHash('sha256')
      .update(JSON.stringify(txData))
      .digest();

    const signature = crypto.sign('sha256', txHash, {
      key: this.privateKey,
      dsaEncoding: 'der'
    });

    return {
      signature: signature.toString('hex'),
      publicKey: this.publicKey.toString('hex')
    };
  }

  getBalance() {
    return {
      confirmed: 0,
      unconfirmed: 0,
      total: 0
    };
  }
}

module.exports = { ConfluxWallet };
