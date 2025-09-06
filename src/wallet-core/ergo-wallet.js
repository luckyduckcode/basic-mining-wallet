const crypto = require('crypto');
const blake2b = require('blake2b');

class ErgoWallet {
  constructor(hdKey) {
    this.hdKey = hdKey;
    this.publicKey = hdKey.publicKey;
    this.privateKey = hdKey.privateKey;
    this.address = this.generateAddress();
  }

  generateAddress() {
    // Ergo uses P2PK addresses with Blake2b hash
    const hash = blake2b(32).update(this.publicKey).digest();

    // Ergo mainnet address prefix
    const networkPrefix = Buffer.from([0x00]); // Mainnet
    const addressType = Buffer.from([0x01]); // P2PK

    const addressBytes = Buffer.concat([networkPrefix, addressType, hash]);

    // Base58 encode
    return this.base58Encode(addressBytes);
  }

  base58Encode(buffer) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';

    let num = buffer.readBigUInt64BE(0);
    while (num > 0) {
      const remainder = Number(num % 58n);
      result = alphabet[remainder] + result;
      num = num / 58n;
    }

    return result;
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

module.exports = { ErgoWallet };
