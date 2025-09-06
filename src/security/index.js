const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = 'aes-256-gcm';

// Encrypt sensitive data
router.post('/encrypt', (req, res) => {
  try {
    const { data } = req.body;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    res.json({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decrypt sensitive data
router.post('/decrypt', (req, res) => {
  try {
    const { encrypted, iv, authTag } = req.body;

    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    res.json(JSON.parse(decrypted));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate JWT token
router.post('/auth/token', (req, res) => {
  try {
    const { userId, walletId } = req.body;

    const token = jwt.sign(
      { userId, walletId },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify JWT token
router.post('/auth/verify', (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    res.json({ valid: true, decoded });
  } catch (error) {
    res.json({ valid: false, error: error.message });
  }
});

// Generate secure seed for wallet
router.get('/seed', (req, res) => {
  try {
    const seed = crypto.randomBytes(32).toString('hex');
    res.json({ seed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multi-signature setup
router.post('/multisig/setup', (req, res) => {
  try {
    const { participants, threshold } = req.body;

    // Generate keys for each participant
    const keys = participants.map(() => ({
      publicKey: crypto.randomBytes(32).toString('hex'),
      privateKey: crypto.randomBytes(32).toString('hex')
    }));

    res.json({
      multisigAddress: crypto.randomBytes(20).toString('hex'), // Mock address
      keys,
      threshold,
      participants: participants.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sign transaction with multi-sig
router.post('/multisig/sign', (req, res) => {
  try {
    const { transaction, signatures } = req.body;

    // This would combine signatures and verify threshold
    const combinedSignature = signatures.join('');

    res.json({
      signedTransaction: transaction,
      signature: combinedSignature,
      status: 'signed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hardware wallet integration (mock)
router.post('/hardware/connect', (req, res) => {
  try {
    const { deviceType } = req.body; // 'ledger' or 'trezor'

    // This would connect to actual hardware wallet
    res.json({
      connected: true,
      deviceType,
      firmware: '1.2.3',
      address: crypto.randomBytes(20).toString('hex')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate backup code
router.get('/backup', (req, res) => {
  try {
    const backupCode = crypto.randomBytes(16).toString('hex').toUpperCase();
    const segments = backupCode.match(/.{1,4}/g);

    res.json({
      backupCode: segments.join('-'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
