// Web Crypto API-based encryption/decryption utility using AES-GCM 256

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-logs-marketplace-secret-passphrase-2026';

/**
 * Derives a CryptoKey for AES-GCM using SHA-256 hashing of the provided passphrase.
 */
async function getCryptoKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(passphrase);
  // Digest the passphrase using SHA-256 to obtain a 256-bit key
  const hash = await crypto.subtle.digest('SHA-256', keyData);
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts cleartext using AES-GCM with a dynamic 12-byte IV.
 * Returns the combined result as "ivHex:ciphertextHex".
 */
export async function encryptText(text: string, passphrase = ENCRYPTION_KEY): Promise<string> {
  if (!text) return '';
  try {
    const key = await getCryptoKey(passphrase);
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(text)
    );

    // Convert to hex representation
    const ivHex = Array.from(iv)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const dataHex = Array.from(new Uint8Array(encrypted))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `${ivHex}:${dataHex}`;
  } catch (err) {
    console.error('Encryption failed:', err);
    throw err;
  }
}

/**
 * Decrypts a combined "ivHex:ciphertextHex" string using AES-GCM.
 * Falls back to returning the original string if format is invalid or decryption fails.
 */
export async function decryptText(encryptedCombined: string, passphrase = ENCRYPTION_KEY): Promise<string> {
  if (!encryptedCombined) return '';
  
  // Backwards compatibility check: if it doesn't contain a colon, it's plaintext
  if (!encryptedCombined.includes(':')) {
    return encryptedCombined;
  }

  try {
    const parts = encryptedCombined.split(':');
    if (parts.length !== 2) {
      return encryptedCombined;
    }
    const [ivHex, dataHex] = parts;

    // Validate hex string format
    if (!/^[0-9a-fA-F]+$/.test(ivHex) || !/^[0-9a-fA-F]+$/.test(dataHex)) {
      return encryptedCombined;
    }

    // Convert hex strings back to Uint8Arrays
    const iv = new Uint8Array(
      ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    const data = new Uint8Array(
      dataHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    const key = await getCryptoKey(passphrase);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.warn('Decryption failed, falling back to plaintext:', err);
    return encryptedCombined;
  }
}
