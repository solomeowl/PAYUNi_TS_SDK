/**
 * 支付功能範例
 * 參考官方 PHP/NET SDK examples/payment/Payment.php
 */

import { PayuniApi, EncryptInfo } from '../../src';

export class Payment {
  private merKey: string;
  private merIV: string;
  private payuniApi: PayuniApi;
  
  constructor() {
    // 請替換為您的商店金鑰
    this.merKey = '12345678901234567890123456789012';
    this.merIV = '1234567890123456';
    
    // 初始化 API (測試環境請加上 't' 參數)
    this.payuniApi = new PayuniApi(this.merKey, this.merIV);
    // 測試環境：
    // this.payuniApi = new PayuniApi(this.merKey, this.merIV, 't');
  }

  /**
   * UPP 整合式支付頁
   * 前台交易，將使用者導向 PAYUNi 支付頁面
   */
  async upp(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      MerTradeNo: 'test' + Date.now(),
      TradeAmt: 100,
      Timestamp: Math.floor(Date.now() / 1000),
      ReturnURL: 'https://yoursite.com/payment/return',
      NotifyURL: 'https://yoursite.com/payment/notify',
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'upp');
    
    // UPP 會返回 HTML 表單，需要在瀏覽器中提交
    if (result.success && typeof result.message === 'string') {
      // 在實際應用中，您會將此 HTML 返回給前端瀏覽器
      console.log('請將以下 HTML 返回給瀏覽器進行自動提交：');
      return result.message;
    }
    
    return result;
  }

  /**
   * 信用卡幕後交易
   * 後台直接處理信用卡支付，不需要跳轉頁面
   */
  async credit(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      MerTradeNo: 'test' + Date.now(),
      TradeAmt: 100,
      Timestamp: Math.floor(Date.now() / 1000),
      CardNo: '4111111111111111',
      CardCVC: '123',
      CardExpired: '1225', // YYMM 格式
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'credit');
    console.log('信用卡交易結果：', result);
    return result;
  }

  /**
   * ATM 虛擬帳號
   * 產生虛擬帳號供使用者轉帳
   */
  async atm(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      MerTradeNo: 'test' + Date.now(),
      TradeAmt: 100,
      Timestamp: Math.floor(Date.now() / 1000),
      BankType: '004', // 銀行代碼
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'atm');
    console.log('ATM 虛擬帳號結果：', result);
    return result;
  }

  /**
   * 超商代碼
   * 產生繳費代碼供使用者至超商繳費
   */
  async cvs(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      MerTradeNo: 'test' + Date.now(),
      TradeAmt: 100,
      Timestamp: Math.floor(Date.now() / 1000),
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'cvs');
    console.log('超商代碼結果：', result);
    return result;
  }

  /**
   * 處理支付返回 (ReturnURL)
   * 使用者完成支付後，瀏覽器會被導向此 URL
   */
  async handleReturn(requestData: any): Promise<any> {
    const result = this.payuniApi.resultProcess(requestData);
    
    if (result.success) {
      console.log('支付成功，交易資訊：', result.message);
      // 在這裡處理成功的邏輯，例如顯示成功頁面
    } else {
      console.log('支付失敗：', result.message);
      // 在這裡處理失敗的邏輯
    }
    
    return result;
  }

  /**
   * 處理支付通知 (NotifyURL)
   * PAYUNi 後台會呼叫此 URL 通知支付結果
   */
  async handleNotify(requestData: any): Promise<any> {
    const result = this.payuniApi.resultProcess(requestData);
    
    if (result.success) {
      console.log('收到支付通知，交易資訊：', result.message);
      // 在這裡更新訂單狀態等後續處理
      // 注意：必須返回純文字 "OK" 給 PAYUNi
      return 'OK';
    } else {
      console.log('支付通知處理失敗：', result.message);
      return 'FAIL';
    }
  }

  /**
   * 使用代理商功能
   * 當您是代理商身份時使用
   */
  async uppWithPlatform(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      IsPlatForm: 1, // 啟用代理商功能
      MerID: 'ABC',
      MerTradeNo: 'test' + Date.now(),
      TradeAmt: 100,
      Timestamp: Math.floor(Date.now() / 1000),
      ReturnURL: 'https://yoursite.com/payment/return',
      NotifyURL: 'https://yoursite.com/payment/notify',
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'upp');
    return result;
  }
}

// 使用範例
async function main() {
  const payment = new Payment();
  
  // 執行不同的支付方式
  // await payment.upp();        // 整合式支付頁
  // await payment.credit();     // 信用卡幕後
  // await payment.atm();        // ATM 虛擬帳號
  // await payment.cvs();        // 超商代碼
  
  // 處理回傳
  // const mockReturnData = { Status: 'SUCCESS', EncryptInfo: '...', HashInfo: '...' };
  // await payment.handleReturn(mockReturnData);
}

// 如果直接執行此檔案
if (require.main === module) {
  main().catch(console.error);
}