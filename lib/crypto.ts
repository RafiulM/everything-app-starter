import crypto from 'crypto';

/**
 * Encryption algorithm used for API key storage
 */
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Key derivation settings
 */
const KEY_DERIVATION_ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits for AES-256
const SALT_LENGTH = 32;
const IV_LENGTH = 16; // 128 bits for GCM
const TAG_LENGTH = 16; // 128 bits for GCM authentication tag

/**
 * Encryption result interface
 */
interface EncryptionResult {
  encrypted: string;
  salt: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts sensitive data using AES-256-GCM
 *
 * @param data - The plaintext data to encrypt (e.g., API key)
 * @param encryptionKey - The base64 encoded encryption key from environment variables
 * @returns Encrypted data object with salt, iv, and tag
 * @throws Error if encryption key is not available or encryption fails
 */
export function encrypt(data: string, encryptionKey?: string): EncryptionResult {
  if (!encryptionKey && !process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required for encryption');
  }

  const key = encryptionKey || process.env.ENCRYPTION_KEY!;

  if (!key) {
    throw new Error('Encryption key is required');
  }

  try {
    // Generate random salt for key derivation
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive encryption key using PBKDF2
    const derivedKey = crypto.pbkdf2Sync(key, salt, KEY_DERIVATION_ITERATIONS, KEY_LENGTH, 'sha256');

    // Generate random IV (initialization vector)
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, derivedKey, iv);
    cipher.setAAD(Buffer.from('api-key-encryption'));

    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts data that was encrypted with AES-256-GCM
 *
 * @param encryptionResult - The encryption result object containing encrypted data, salt, iv, and tag
 * @param encryptionKey - The base64 encoded encryption key from environment variables
 * @returns The decrypted plaintext data
 * @throws Error if encryption key is not available, decryption fails, or data is tampered
 */
export function decrypt(encryptionResult: EncryptionResult, encryptionKey?: string): string {
  if (!encryptionKey && !process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required for decryption');
  }

  const key = encryptionKey || process.env.ENCRYPTION_KEY!;

  if (!key) {
    throw new Error('Encryption key is required');
  }

  try {
    // Convert hex strings back to buffers
    const salt = Buffer.from(encryptionResult.salt, 'hex');
    const iv = Buffer.from(encryptionResult.iv, 'hex');
    const tag = Buffer.from(encryptionResult.tag, 'hex');

    // Derive the same encryption key using PBKDF2
    const derivedKey = crypto.pbkdf2Sync(key, salt, KEY_DERIVATION_ITERATIONS, KEY_LENGTH, 'sha256');

    // Create decipher
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, derivedKey, iv);
    decipher.setAAD(Buffer.from('api-key-encryption'));
    decipher.setAuthTag(tag);

    // Decrypt the data
    let decrypted = decipher.update(encryptionResult.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a cryptographically secure random encryption key
 *
 * @returns A base64 encoded 256-bit encryption key
 */
export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(KEY_LENGTH);
  return key.toString('base64');
}

/**
 * Validates that the encryption key is properly formatted and has sufficient length
 *
 * @param key - The encryption key to validate
 * @returns True if the key is valid
 */
export function validateEncryptionKey(key: string): boolean {
  try {
    const decoded = Buffer.from(key, 'base64');
    return decoded.length >= 32; // At least 256 bits
  } catch {
    return false;
  }
}