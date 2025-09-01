import { CryptoHelper } from '../src/utils/crypto';

describe('CryptoHelper', () => {
  const merKey = '12345678901234567890123456789012';
  const merIV = '1234567890123456';
  let cryptoHelper: CryptoHelper;

  beforeEach(() => {
    cryptoHelper = new CryptoHelper(merKey, merIV);
  });

  describe('Constructor', () => {
    it('should initialize with correct key and IV', () => {
      expect(cryptoHelper).toBeInstanceOf(CryptoHelper);
    });

    it('should trim whitespace from key and IV', () => {
      const cryptoWithSpaces = new CryptoHelper('  ' + merKey + '  ', '  ' + merIV + '  ');
      expect(cryptoWithSpaces).toBeInstanceOf(CryptoHelper);
    });
  });

  describe('Encryption and Decryption', () => {
    const testData = {
      MerID: 'TEST123',
      Timestamp: 1234567890,
      TradeAmt: 1000,
      MerTradeNo: 'TEST001'
    };

    it('should encrypt data successfully', () => {
      const encrypted = cryptoHelper.encrypt(testData);
      
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      // Should be hex string
      expect(/^[a-f0-9]+$/i.test(encrypted)).toBe(true);
    });

    it('should decrypt data successfully', () => {
      const encrypted = cryptoHelper.encrypt(testData);
      const decrypted = cryptoHelper.decrypt(encrypted);
      
      expect(decrypted).toEqual(
        expect.objectContaining({
          MerID: 'TEST123',
          Timestamp: '1234567890',
          TradeAmt: '1000',
          MerTradeNo: 'TEST001'
        })
      );
    });

    it('should handle empty object', () => {
      const emptyData = {};
      const encrypted = cryptoHelper.encrypt(emptyData);
      const decrypted = cryptoHelper.decrypt(encrypted);
      
      expect(decrypted).toEqual({});
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => {
        cryptoHelper.decrypt('invalid_hex_data');
      }).toThrow('Decryption failed');
    });

    it('should throw error for malformed encrypted data', () => {
      expect(() => {
        cryptoHelper.decrypt('48656c6c6f'); // Valid hex but wrong format
      }).toThrow('Invalid encrypted data format');
    });
  });

  describe('Hash Generation and Verification', () => {
    const testString = 'test_encrypted_data';

    it('should generate hash successfully', () => {
      const hash = cryptoHelper.generateHash(testString);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 hex length
      expect(/^[A-F0-9]+$/.test(hash)).toBe(true); // Should be uppercase hex
    });

    it('should generate consistent hash', () => {
      const hash1 = cryptoHelper.generateHash(testString);
      const hash2 = cryptoHelper.generateHash(testString);
      
      expect(hash1).toBe(hash2);
    });

    it('should verify hash correctly', () => {
      const hash = cryptoHelper.generateHash(testString);
      
      expect(cryptoHelper.verifyHash(testString, hash)).toBe(true);
      expect(cryptoHelper.verifyHash(testString, 'wrong_hash')).toBe(false);
    });

    it('should handle case insensitive hash verification', () => {
      const hash = cryptoHelper.generateHash(testString);
      const lowerHash = hash.toLowerCase();
      
      expect(cryptoHelper.verifyHash(testString, lowerHash)).toBe(true);
    });
  });

  describe('Query String Conversion', () => {
    it('should handle special characters in values', () => {
      const dataWithSpecialChars = {
        desc: 'Test & Product',
        email: 'test+user@example.com',
        special: 'data with spaces & symbols!'
      };
      
      const encrypted = cryptoHelper.encrypt(dataWithSpecialChars);
      const decrypted = cryptoHelper.decrypt(encrypted);
      
      expect(decrypted.desc).toBe('Test & Product');
      expect(decrypted.email).toBe('test+user@example.com');
      expect(decrypted.special).toBe('data with spaces & symbols!');
    });

    it('should handle null and undefined values', () => {
      const dataWithNulls = {
        validField: 'value',
        nullField: null,
        undefinedField: undefined,
        emptyString: '',
        zero: 0
      };
      
      const encrypted = cryptoHelper.encrypt(dataWithNulls);
      const decrypted = cryptoHelper.decrypt(encrypted);
      
      expect(decrypted.validField).toBe('value');
      expect(decrypted.emptyString).toBe('');
      expect(decrypted.zero).toBe('0');
      // null and undefined should not be present
      expect('nullField' in decrypted).toBe(false);
      expect('undefinedField' in decrypted).toBe(false);
    });

    it('should sort keys for consistent encryption', () => {
      const data1 = { b: '2', a: '1', c: '3' };
      const data2 = { a: '1', c: '3', b: '2' };
      
      const encrypted1 = cryptoHelper.encrypt(data1);
      const encrypted2 = cryptoHelper.encrypt(data2);
      
      // Should produce same encryption due to key sorting
      expect(encrypted1).toBe(encrypted2);
    });
  });
});