import * as crypto from 'crypto';

export class CryptoHelper {
  private merKey: string;
  private merIV: string;

  constructor(merKey: string, merIV: string) {
    this.merKey = merKey.trim();
    this.merIV = merIV.trim();
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(data: Record<string, any>): string {
    // Convert object to URL-encoded string
    const queryString = this.objectToQueryString(data);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', this.merKey, this.merIV);
    
    // Encrypt data
    let encrypted = cipher.update(queryString, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Combine encrypted data and tag with separator
    const combined = encrypted + ':::' + authTag.toString('base64');
    
    // Convert to hex
    return Buffer.from(combined).toString('hex');
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(encryptedHex: string): Record<string, any> {
    try {
      // Convert hex to buffer
      const combined = Buffer.from(encryptedHex, 'hex').toString();
      
      // Split encrypted data and auth tag
      const [encryptedBase64, authTagBase64] = combined.split(':::');
      
      if (!encryptedBase64 || !authTagBase64) {
        throw new Error('Invalid encrypted data format');
      }
      
      // Create decipher
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.merKey, this.merIV);
      
      // Set auth tag
      decipher.setAuthTag(Buffer.from(authTagBase64, 'base64'));
      
      // Decrypt data
      let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Parse query string to object
      return this.queryStringToObject(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate SHA256 hash
   */
  generateHash(encryptStr: string): string {
    const hashString = this.merKey + encryptStr + this.merIV;
    return crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
  }

  /**
   * Verify hash
   */
  verifyHash(encryptStr: string, hash: string): boolean {
    const calculatedHash = this.generateHash(encryptStr);
    return calculatedHash === hash.toUpperCase();
  }

  /**
   * Convert object to URL-encoded query string
   */
  private objectToQueryString(obj: Record<string, any>): string {
    const params = new URLSearchParams();
    
    // Sort keys to ensure consistent ordering
    const sortedKeys = Object.keys(obj).sort();
    
    for (const key of sortedKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        params.append(key, String(obj[key]));
      }
    }
    
    const result = params.toString();
    // If empty object, return a minimal placeholder to avoid encryption issues
    return result || 'empty=1';
  }

  /**
   * Parse URL-encoded query string to object
   */
  private queryStringToObject(queryString: string): Record<string, any> {
    const params = new URLSearchParams(queryString);
    const result: Record<string, any> = {};
    
    params.forEach((value, key) => {
      // Skip the empty placeholder
      if (key === 'empty' && value === '1') {
        return;
      }
      
      // Handle array notation (e.g., key[0], key[1])
      if (key.includes('[') && key.includes(']')) {
        const baseKey = key.substring(0, key.indexOf('['));
        if (!result[baseKey]) {
          result[baseKey] = [];
        }
        result[baseKey].push(value);
      } else {
        result[key] = value;
      }
    });
    
    return result;
  }
}