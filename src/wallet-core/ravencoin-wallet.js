const crypto = require('crypto');

class RavencoinWallet {
  constructor(hdKey) {
    this.hdKey = hdKey;
    this.publicKey = hdKey.publicKey;
    this.privateKey = hdKey.privateKey;
    this.address = this.generateAddress();
  }

  generateAddress() {
    // Ravencoin uses Bitcoin-like addresses with 'R' prefix
    const sha256 = crypto.createHash('sha256').update(this.publicKey).digest();
    const ripemd160 = crypto.createHash('ripemd160').update(sha256).digest();

    // Add version byte (0x3C for Ravencoin mainnet)
    const versionedPayload = Buffer.concat([Buffer.from([0x3C]), ripemd160]);

    // Double SHA256 for checksum
    const checksum = crypto.createHash('sha256')
      .update(crypto.createHash('sha256').update(versionedPayload).digest())
      .digest()
      .slice(0, 4);

    const fullPayload = Buffer.concat([versionedPayload, checksum]);

    // Base58 encode
    return this.base58Encode(fullPayload);
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

    // Add leading 'R' for Ravencoin
    return 'R' + result;
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

module.exports = { RavencoinWallet };
