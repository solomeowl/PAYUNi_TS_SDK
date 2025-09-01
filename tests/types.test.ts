import { 
  EncryptInfo, 
  PaymentMode, 
  EnvironmentType, 
  PayuniConfig,
  BatchQueryResult,
  TradeQueryResponse 
} from '../src/types';

describe('Type Definitions', () => {
  describe('EncryptInfo Interface', () => {
    it('should accept valid encrypt info object', () => {
      const encryptInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: 1234567890,
        MerTradeNo: 'ORDER001',
        TradeAmt: 1000,
        ProdDesc: 'Test Product',
        UsrMail: 'test@example.com',
        ReturnURL: 'https://example.com/return',
        NotifyURL: 'https://example.com/notify'
      };
      
      expect(encryptInfo.MerID).toBe('TEST123');
      expect(encryptInfo.Timestamp).toBe(1234567890);
      expect(encryptInfo.TradeAmt).toBe(1000);
    });

    it('should accept minimal required fields', () => {
      const minimalInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: Date.now()
      };
      
      expect(minimalInfo.MerID).toBe('TEST123');
      expect(typeof minimalInfo.Timestamp).toBe('number');
    });

    it('should accept credit card fields', () => {
      const creditInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: Date.now(),
        MerTradeNo: 'ORDER001',
        TradeAmt: 1000,
        CardNo: '4111111111111111',
        CardCVC: '123',
        CardExpired: '1225',
        CreditHash: 'existing_hash',
        CreditInstallment: '3'
      };
      
      expect(creditInfo.CardNo).toBe('4111111111111111');
      expect(creditInfo.CardCVC).toBe('123');
      expect(creditInfo.CreditHash).toBe('existing_hash');
    });

    it('should accept ATM specific fields', () => {
      const atmInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: Date.now(),
        BankType: '004',
        ExpireDate: '20241231'
      };
      
      expect(atmInfo.BankType).toBe('004');
      expect(atmInfo.ExpireDate).toBe('20241231');
    });

    it('should accept CVS specific fields', () => {
      const cvsInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: Date.now(),
        CVSType: 'ALL'
      };
      
      expect(cvsInfo.CVSType).toBe('ALL');
    });

    it('should accept platform mode', () => {
      const platformInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: Date.now(),
        IsPlatForm: 1
      };
      
      expect(platformInfo.IsPlatForm).toBe(1);
    });

    it('should accept additional dynamic fields', () => {
      const dynamicInfo: EncryptInfo = {
        MerID: 'TEST123',
        Timestamp: Date.now(),
        customField: 'custom_value',
        anotherField: 123
      };
      
      expect(dynamicInfo.customField).toBe('custom_value');
      expect(dynamicInfo.anotherField).toBe(123);
    });
  });

  describe('PaymentMode Type', () => {
    it('should accept all valid payment modes', () => {
      const modes: PaymentMode[] = [
        'upp',
        'atm',
        'cvs',
        'credit',
        'linepay',
        'aftee_direct',
        'trade_query',
        'trade_close',
        'trade_cancel',
        'credit_bind_query',
        'credit_bind_cancel',
        'cancel_cvs',
        'trade_confirm_aftee',
        'trade_refund_icash',
        'trade_refund_aftee',
        'trade_refund_linepay'
      ];
      
      modes.forEach(mode => {
        expect(typeof mode).toBe('string');
        expect(mode.length).toBeGreaterThan(0);
      });
      
      expect(modes.length).toBe(16);
    });
  });

  describe('EnvironmentType', () => {
    it('should accept valid environment types', () => {
      const prodEnv: EnvironmentType = '';
      const testEnv: EnvironmentType = 't';
      
      expect(prodEnv).toBe('');
      expect(testEnv).toBe('t');
    });
  });

  describe('PayuniConfig Interface', () => {
    it('should accept valid config', () => {
      const config: PayuniConfig = {
        merKey: '12345678901234567890123456789012',
        merIV: '1234567890123456',
        type: 't'
      };
      
      expect(config.merKey).toBe('12345678901234567890123456789012');
      expect(config.merIV).toBe('1234567890123456');
      expect(config.type).toBe('t');
    });

    it('should accept config without type', () => {
      const config: PayuniConfig = {
        merKey: '12345678901234567890123456789012',
        merIV: '1234567890123456'
      };
      
      expect(config.merKey).toBe('12345678901234567890123456789012');
      expect(config.merIV).toBe('1234567890123456');
      expect(config.type).toBeUndefined();
    });
  });

  describe('BatchQueryResult Interface', () => {
    it('should accept valid batch query result', () => {
      const result: BatchQueryResult = {
        tradeNo: 'TXN123',
        result: {
          success: true,
          message: 'Query successful'
        }
      };
      
      expect(result.tradeNo).toBe('TXN123');
      expect(result.result.success).toBe(true);
      expect(result.result.message).toBe('Query successful');
    });
  });

  describe('TradeQueryResponse Interface', () => {
    it('should accept valid trade query response', () => {
      const response: TradeQueryResponse = {
        Status: 'SUCCESS',
        TradeNo: 'TXN123',
        TradeAmt: 1000,
        MerTradeNo: 'ORDER001',
        PayType: 'credit'
      };
      
      expect(response.Status).toBe('SUCCESS');
      expect(response.TradeNo).toBe('TXN123');
      expect(response.TradeAmt).toBe(1000);
      expect(response.MerTradeNo).toBe('ORDER001');
      expect(response.PayType).toBe('credit');
    });

    it('should accept minimal response', () => {
      const response: TradeQueryResponse = {
        Status: 'ERROR'
      };
      
      expect(response.Status).toBe('ERROR');
    });

    it('should accept additional fields', () => {
      const response: TradeQueryResponse = {
        Status: 'SUCCESS',
        customField: 'custom_value',
        anotherField: 123
      };
      
      expect(response.Status).toBe('SUCCESS');
      expect(response.customField).toBe('custom_value');
      expect(response.anotherField).toBe(123);
    });
  });
});