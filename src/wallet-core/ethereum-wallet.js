const crypto = require('crypto');
const { keccak256 } = require('js-sha3');
const secp256k1 = require('secp256k1');

class EthereumWallet {
  constructor(hdKey) {
    this.hdKey = hdKey;
    this.publicKey = hdKey.publicKey;
    this.privateKey = hdKey.privateKey;
    this.address = this.generateAddress();
  }

  generateAddress() {
    // Generate Ethereum address from public key
    const publicKeyHash = keccak256(this.publicKey.slice(1)); // Remove 0x04 prefix
    const address = '0x' + publicKeyHash.substring(24); // Take last 20 bytes (40 chars)

    return address;
  }

  signTransaction(txData) {
    // Create transaction hash
    const txHash = this.createTransactionHash(txData);

    // Sign the hash
    const signature = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(txHash, 'hex')), this.privateKey);

    return {
      signature: signature.signature.toString('hex'),
      recovery: signature.recid,
      publicKey: this.publicKey.toString('hex')
    };
  }

  createTransactionHash(txData) {
    // Simplified Ethereum transaction RLP encoding
    const tx = {
      nonce: txData.nonce || 0,
      gasPrice: txData.gasPrice || '0x09184e72a000',
      gasLimit: txData.gasLimit || '0x5208',
      to: txData.to,
      value: txData.value,
      data: txData.data || '0x',
      chainId: txData.chainId || 1
    };

    // Create RLP-like encoding for hashing
    const txString = JSON.stringify(tx);
    return keccak256(txString);
  }

  signMessage(message) {
    const messagePrefix = '\x19Ethereum Signed Message:\n';
    const messageLength = Buffer.alloc(1);
    messageLength.writeUInt8(message.length);

    const messageToSign = Buffer.concat([
      Buffer.from(messagePrefix),
      messageLength,
      Buffer.from(message)
    ]);

    const messageHash = keccak256(messageToSign);
    const signature = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(messageHash, 'hex')), this.privateKey);

    return {
      signature: signature.signature.toString('hex'),
      recovery: signature.recid,
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

module.exports = { EthereumWallet };
