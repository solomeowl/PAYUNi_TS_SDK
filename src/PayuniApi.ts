import axios, { AxiosInstance } from 'axios';
import { CryptoHelper } from './utils/crypto';
import {
  EncryptInfo,
  ParameterModel,
  ApiResponse,
  ResultModel,
  PaymentMode,
  EnvironmentType
} from './types';

export class PayuniApi {
  private merKey: string;
  private merIV: string;
  private apiUrl: string;
  private cryptoHelper: CryptoHelper;
  private httpClient: AxiosInstance;

  private readonly URL_MAPPING: Record<string, string> = {
    'upp': 'upp',
    'atm': 'atm',
    'cvs': 'cvs',
    'credit': 'credit',
    'linepay': 'linepay',
    'aftee_direct': 'aftee/direct',
    'trade_query': 'trade/query',
    'trade_close': 'trade/close',
    'trade_cancel': 'trade/cancel',
    'cancel_cvs': 'cancel/cvs',
    'credit_bind_query': 'credit_bind/query',
    'credit_bind_cancel': 'credit_bind/cancel',
    'trade_refund_icash': 'trade/common/refund/icash',
    'trade_refund_aftee': 'trade/common/refund/aftee',
    'trade_confirm_aftee': 'trade/common/confirm/aftee',
    'trade_refund_linepay': 'trade/common/refund/linepay'
  };

  constructor(merKey: string, merIV: string, type: EnvironmentType = '') {
    this.merKey = merKey.trim();
    this.merIV = merIV.trim();
    
    // Set API URL based on environment
    const baseUrl = type === 't' 
      ? 'https://sandbox-api.payuni.com.tw/api/'
      : 'https://api.payuni.com.tw/api/';
    
    this.apiUrl = baseUrl;
    
    // Initialize crypto helper
    this.cryptoHelper = new CryptoHelper(this.merKey, this.merIV);
    
    // Initialize HTTP client
    this.httpClient = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PRESCOSDKAPI'
      },
      timeout: 30000
    });
  }

  /**
   * Main method for all API operations
   */
  async universalTrade(
    encryptInfo: EncryptInfo,
    mode: PaymentMode,
    version: string = '1.0'
  ): Promise<ResultModel> {
    try {
      // Validate required fields
      const validationResult = this.validateFields(encryptInfo, mode);
      if (!validationResult.success) {
        return validationResult;
      }

      // Set default version for LINE Pay
      if (mode === 'linepay' && version === '1.0') {
        version = '1.1';
      }

      // Encrypt data
      const encryptedData = this.cryptoHelper.encrypt(encryptInfo);
      
      // Generate hash
      const hashInfo = this.cryptoHelper.generateHash(encryptedData);
      
      // Prepare request parameters
      const params: ParameterModel = {
        MerID: encryptInfo.MerID,
        Version: version,
        EncryptInfo: encryptedData,
        HashInfo: hashInfo
      };

      // Add IsPlatForm if present
      if (encryptInfo.IsPlatForm) {
        params.IsPlatForm = String(encryptInfo.IsPlatForm);
      }

      // Get API endpoint
      const endpoint = this.URL_MAPPING[mode];
      if (!endpoint) {
        return {
          success: false,
          message: `Invalid mode: ${mode}`
        };
      }

      // Special handling for UPP (frontend payment)
      if (mode === 'upp') {
        return this.handleUppPayment(params, endpoint);
      }

      // Make API request for backend operations
      const response = await this.httpClient.post(endpoint, new URLSearchParams(params as any).toString());
      
      // Process response
      return this.processApiResponse(response.data);
      
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Process response from ReturnURL or NotifyURL
   */
  resultProcess(requestData: any): ResultModel {
    try {
      // Parse data if it's a string
      let data: ApiResponse;
      if (typeof requestData === 'string') {
        data = JSON.parse(requestData);
      } else {
        data = requestData;
      }

      // Check status
      if (data.Status === 'ERROR' || !data.Status) {
        return {
          success: false,
          message: data.Message || 'Unknown error'
        };
      }

      // Verify hash if EncryptInfo exists
      if (data.EncryptInfo && data.HashInfo) {
        const isValidHash = this.cryptoHelper.verifyHash(data.EncryptInfo, data.HashInfo);
        
        if (!isValidHash) {
          return {
            success: false,
            message: 'Hash validation failed'
          };
        }

        // Decrypt the response
        try {
          const decryptedData = this.cryptoHelper.decrypt(data.EncryptInfo);
          return {
            success: true,
            message: decryptedData
          };
        } catch (decryptError) {
          return {
            success: false,
            message: `Decryption failed: ${decryptError instanceof Error ? decryptError.message : 'Unknown error'}`
          };
        }
      }

      // Return raw data if no encryption
      return {
        success: true,
        message: data
      };
      
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process result'
      };
    }
  }

  /**
   * Validate required fields based on trade mode
   */
  private validateFields(encryptInfo: EncryptInfo, mode: PaymentMode): ResultModel {
    // Basic validation for all modes
    if (!encryptInfo.MerID) {
      return { success: false, message: 'MerID is required' };
    }
    
    if (!encryptInfo.Timestamp) {
      return { success: false, message: 'Timestamp is required' };
    }

    // Mode-specific validation
    switch (mode) {
      case 'upp':
      case 'atm':
      case 'cvs':
      case 'credit':
      case 'linepay':
      case 'aftee_direct':
        // Payment modes require trade info
        if (!encryptInfo.MerTradeNo) {
          return { success: false, message: 'MerTradeNo is required for payment' };
        }
        if (!encryptInfo.TradeAmt) {
          return { success: false, message: 'TradeAmt is required for payment' };
        }
        
        // UPP requires return URLs
        if (mode === 'upp') {
          if (!encryptInfo.ReturnURL) {
            return { success: false, message: 'ReturnURL is required for UPP' };
          }
          if (!encryptInfo.NotifyURL) {
            return { success: false, message: 'NotifyURL is required for UPP' };
          }
        }
        
        // Credit card specific
        if (mode === 'credit') {
          const hasCardInfo = encryptInfo.CardNo && encryptInfo.CardCVC && encryptInfo.CardExpired;
          const hasCreditHash = encryptInfo.CreditHash;
          
          if (!hasCardInfo && !hasCreditHash) {
            return { success: false, message: 'Credit card information or CreditHash is required' };
          }
        }
        break;
        
      case 'trade_query':
      case 'trade_close':
      case 'trade_cancel':
      case 'cancel_cvs':
      case 'trade_confirm_aftee':
      case 'trade_refund_icash':
      case 'trade_refund_aftee':
      case 'trade_refund_linepay':
        // These operations require TradeNo
        if (!encryptInfo.TradeNo) {
          return { success: false, message: 'TradeNo is required for this operation' };
        }
        break;
        
      case 'credit_bind_query':
      case 'credit_bind_cancel':
        // Credit bind operations have their own validation
        break;
    }

    return { success: true, message: 'Validation passed' };
  }

  /**
   * Handle UPP payment (returns HTML form for frontend submission)
   */
  private handleUppPayment(params: ParameterModel, endpoint: string): ResultModel {
    const formHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PAYUNi Payment</title>
</head>
<body>
    <form id="payuniForm" method="POST" action="${this.apiUrl}${endpoint}">
        <input type="hidden" name="MerID" value="${params.MerID}">
        <input type="hidden" name="Version" value="${params.Version}">
        <input type="hidden" name="EncryptInfo" value="${params.EncryptInfo}">
        <input type="hidden" name="HashInfo" value="${params.HashInfo}">
        ${params.IsPlatForm ? `<input type="hidden" name="IsPlatForm" value="${params.IsPlatForm}">` : ''}
    </form>
    <script>
        document.getElementById('payuniForm').submit();
    </script>
</body>
</html>`;

    return {
      success: true,
      message: formHtml
    };
  }

  /**
   * Process API response
   */
  private processApiResponse(response: ApiResponse): ResultModel {
    // Check for error status
    if (response.Status === 'ERROR') {
      return {
        success: false,
        message: response.Message || 'API error'
      };
    }

    // Special handling for specific error codes
    if (response.Status === 'API00003') {
      return {
        success: false,
        message: 'Hash validation failed at server'
      };
    }

    // Verify and decrypt response if encrypted
    if (response.EncryptInfo && response.HashInfo) {
      const isValidHash = this.cryptoHelper.verifyHash(response.EncryptInfo, response.HashInfo);
      
      if (!isValidHash) {
        return {
          success: false,
          message: 'Response hash validation failed'
        };
      }

      try {
        const decryptedData = this.cryptoHelper.decrypt(response.EncryptInfo);
        return {
          success: true,
          message: decryptedData
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to decrypt response: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }

    // Return raw response if not encrypted
    return {
      success: response.Status === 'SUCCESS',
      message: response
    };
  }
}