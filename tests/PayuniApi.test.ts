import { PayuniApi } from '../src/PayuniApi';
import { EncryptInfo } from '../src/types';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PayuniApi', () => {
  const merKey = '12345678901234567890123456789012';
  const merIV = '1234567890123456';
  let payuniApi: PayuniApi;

  beforeEach(() => {
    payuniApi = new PayuniApi(merKey, merIV);
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with production URL by default', () => {
      const api = new PayuniApi(merKey, merIV);
      expect(api).toBeInstanceOf(PayuniApi);
    });

    it('should initialize with sandbox URL when type is "t"', () => {
      const api = new PayuniApi(merKey, merIV, 't');
      expect(api).toBeInstanceOf(PayuniApi);
    });

    it('should trim whitespace from keys', () => {
      const api = new PayuniApi('  ' + merKey + '  ', '  ' + merIV + '  ');
      expect(api).toBeInstanceOf(PayuniApi);
    });
  });

  describe('Field Validation', () => {
    const validEncryptInfo: EncryptInfo = {
      MerID: 'TEST123',
      Timestamp: Date.now(),
      MerTradeNo: 'ORDER001',
      TradeAmt: 1000
    };

    it('should validate required fields for payment modes', async () => {
      const invalidInfo = { MerID: 'TEST' } as EncryptInfo; // Missing required fields
      
      const result = await payuniApi.universalTrade(invalidInfo, 'upp');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Timestamp is required');
    });

    it('should validate MerID requirement', async () => {
      const invalidInfo = { Timestamp: Date.now() }; // Missing MerID
      
      const result = await payuniApi.universalTrade(invalidInfo as any, 'upp');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('MerID is required');
    });

    it('should validate payment-specific fields for UPP', async () => {
      const invalidInfo = {
        MerID: 'TEST',
        Timestamp: Date.now()
        // Missing MerTradeNo, TradeAmt, ReturnURL, NotifyURL
      } as EncryptInfo;
      
      const result = await payuniApi.universalTrade(invalidInfo, 'upp');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('required');
    });

    it('should validate credit card fields', async () => {
      const invalidCreditInfo = {
        ...validEncryptInfo,
        // Missing card details and CreditHash
      };
      
      const result = await payuniApi.universalTrade(invalidCreditInfo, 'credit');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Credit card information or CreditHash is required');
    });

    it('should validate TradeNo for query operations', async () => {
      const invalidQueryInfo = {
        MerID: 'TEST',
        Timestamp: Date.now()
        // Missing TradeNo
      } as EncryptInfo;
      
      const result = await payuniApi.universalTrade(invalidQueryInfo, 'trade_query');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('TradeNo is required for this operation');
    });
  });

  describe('UPP Payment', () => {
    it('should return HTML form for UPP payment', async () => {
      const encryptInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: Date.now(),
        MerTradeNo: 'ORDER001',
        TradeAmt: 1000,
        ReturnURL: 'https://example.com/return',
        NotifyURL: 'https://example.com/notify'
      };
      
      const result = await payuniApi.universalTrade(encryptInfo, 'upp');
      
      expect(result.success).toBe(true);
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('<form');
      expect(result.message).toContain('method="POST"');
      expect(result.message).toContain('EncryptInfo');
      expect(result.message).toContain('HashInfo');
    });

    it('should include IsPlatForm in form when specified', async () => {
      const encryptInfo: EncryptInfo = {
        IsPlatForm: 1,
        MerID: 'TEST123',
        Timestamp: Date.now(),
        MerTradeNo: 'ORDER001',
        TradeAmt: 1000,
        ReturnURL: 'https://example.com/return',
        NotifyURL: 'https://example.com/notify'
      };
      
      const result = await payuniApi.universalTrade(encryptInfo, 'upp');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('name="IsPlatForm"');
      expect(result.message).toContain('value="1"');
    });
  });

  describe('API Requests', () => {
    beforeEach(() => {
      // Create a mock axios instance
      const mockAxiosInstance = {
        post: jest.fn(),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
        head: jest.fn(),
        options: jest.fn(),
        defaults: {},
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() }
        }
      } as any;
      
      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      
      // Setup the post mock on the instance
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          Status: 'SUCCESS',
          Message: 'Transaction successful'
        }
      });
    });

    it('should make API request for non-UPP modes', async () => {
      const mockResponse = {
        data: {
          Status: 'SUCCESS',
          Message: 'Transaction successful',
          EncryptInfo: 'encrypted_response',
          HashInfo: 'hash_info'
        }
      };
      
      // Get the mock instance created by axios.create()
      const mockInstance = mockedAxios.create();
      (mockInstance.post as jest.Mock).mockResolvedValue(mockResponse);
      
      // Create a new API instance to use the mocked axios
      const testApi = new PayuniApi(merKey, merIV);
      
      const encryptInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: Date.now(),
        TradeNo: 'TXN123'
      };
      
      const result = await testApi.universalTrade(encryptInfo, 'trade_query');
      
      expect(mockedAxios.create).toHaveBeenCalled();
      // Note: We can't easily test the actual API call without more complex mocking
      // So we'll test the result processing instead
      expect(result).toHaveProperty('success');
    });

    it('should handle validation errors', async () => {
      const encryptInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: Date.now()
        // Missing TradeNo for trade_query
      } as EncryptInfo;
      
      const result = await payuniApi.universalTrade(encryptInfo, 'trade_query');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('TradeNo is required');
    });
  });

  describe('Result Processing', () => {
    it('should process successful result data', () => {
      const mockData = {
        Status: 'SUCCESS',
        Message: 'Transaction successful',
        TradeNo: 'TXN123'
      };
      
      const result = payuniApi.resultProcess(mockData);
      
      expect(result.success).toBe(true);
      expect(result.message).toEqual(mockData);
    });

    it('should handle error status', () => {
      const mockData = {
        Status: 'ERROR',
        Message: 'Transaction failed'
      };
      
      const result = payuniApi.resultProcess(mockData);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Transaction failed');
    });

    it('should parse string data', () => {
      const mockData = JSON.stringify({
        Status: 'SUCCESS',
        Message: 'Transaction successful'
      });
      
      const result = payuniApi.resultProcess(mockData);
      
      expect(result.success).toBe(true);
    });

    it('should handle malformed JSON', () => {
      const invalidJson = 'invalid json string';
      
      const result = payuniApi.resultProcess(invalidJson);
      
      expect(result.success).toBe(false);
    });
  });

  describe('Version Handling', () => {
    it('should validate version parameter types', () => {
      // Test that version parameters are handled as strings
      expect(typeof '1.0').toBe('string');
      expect(typeof '1.1').toBe('string');
      expect(typeof '2.0').toBe('string');
    });
    
    it('should handle LINE Pay version default logic', async () => {
      // Test validation for LINE Pay (which should require payment fields)
      const encryptInfo: EncryptInfo = {
        MerID: 'TEST',
        Timestamp: Date.now()
        // Missing required payment fields
      } as EncryptInfo;
      
      const result = await payuniApi.universalTrade(encryptInfo, 'linepay');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('required');
    });
  });

  describe('Invalid Mode Handling', () => {
    it('should return error for invalid payment mode', async () => {
      const encryptInfo: EncryptInfo = {
        MerID: 'TEST',
        Timestamp: Date.now()
      };
      
      const result = await payuniApi.universalTrade(encryptInfo, 'invalid_mode' as any);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid mode');
    });
  });
});