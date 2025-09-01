/**
 * 信用卡綁定功能範例
 * 參考官方 PHP/NET SDK examples/cardit_bind/CardBind.php
 */

import { PayuniApi, EncryptInfo } from '../../src';

export class CreditBind {
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
   * 信用卡綁定查詢
   * 查詢已綁定的信用卡 Token
   */
  async creditBindQuery(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      Timestamp: Math.floor(Date.now() / 1000),
      UsrMail: 'customer@example.com', // 使用者 Email
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'credit_bind_query');
    console.log('信用卡綁定查詢結果：', result);
    
    if (result.success && result.message) {
      const bindInfo = result.message;
      
      // 如果有綁定的卡片
      if (bindInfo.CreditHash) {
        console.log('已綁定的信用卡 Token：', bindInfo.CreditHash);
        console.log('卡號末四碼：', bindInfo.Card4No);
        // 可以使用此 CreditHash 進行後續扣款
      } else {
        console.log('此用戶尚未綁定信用卡');
      }
    }
    
    return result;
  }

  /**
   * 信用卡綁定取消
   * 取消已綁定的信用卡 Token
   */
  async creditBindCancel(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      Timestamp: Math.floor(Date.now() / 1000),
      CreditHash: 'YOUR_CREDIT_HASH_TO_CANCEL', // 要取消的信用卡 Token
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'credit_bind_cancel');
    console.log('信用卡綁定取消結果：', result);
    
    if (result.success) {
      console.log('信用卡綁定已成功取消');
    } else {
      console.log('取消失敗：', result.message);
    }
    
    return result;
  }

  /**
   * 使用綁定的信用卡進行扣款
   * 使用已儲存的 CreditHash 進行交易
   */
  async payWithCreditHash(creditHash: string, amount: number): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      MerTradeNo: 'bind' + Date.now(),
      TradeAmt: amount,
      Timestamp: Math.floor(Date.now() / 1000),
      CreditHash: creditHash, // 使用儲存的信用卡 Token
      CreditInstallment: '0', // 分期期數，0 為不分期
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'credit');
    console.log('使用綁定信用卡扣款結果：', result);
    
    if (result.success) {
      console.log('扣款成功');
      const tradeInfo = result.message;
      console.log('交易編號：', tradeInfo.TradeNo);
    } else {
      console.log('扣款失敗：', result.message);
    }
    
    return result;
  }

  /**
   * 首次綁定並扣款
   * 第一次使用信用卡時，同時完成綁定和扣款
   */
  async firstBindAndPay(cardInfo: any, amount: number): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      MerTradeNo: 'firstbind' + Date.now(),
      TradeAmt: amount,
      Timestamp: Math.floor(Date.now() / 1000),
      CardNo: cardInfo.cardNo,
      CardCVC: cardInfo.cardCVC,
      CardExpired: cardInfo.cardExpired,
      UsrMail: cardInfo.email,
      CreditBind: 1, // 啟用信用卡綁定
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'credit');
    console.log('首次綁定並扣款結果：', result);
    
    if (result.success) {
      const tradeInfo = result.message;
      if (tradeInfo.CreditHash) {
        console.log('綁定成功，CreditHash：', tradeInfo.CreditHash);
        console.log('請儲存此 CreditHash 供後續使用');
        
        // 儲存 CreditHash 到資料庫
        // await saveUserCreditHash(cardInfo.email, tradeInfo.CreditHash);
      }
    }
    
    return result;
  }

  /**
   * 管理用戶的所有綁定卡片
   * 實務應用範例
   */
  async manageUserCards(userEmail: string): Promise<any> {
    console.log(`=== 管理用戶 ${userEmail} 的信用卡 ===`);
    
    // 1. 查詢現有綁定
    const queryResult = await this.payuniApi.universalTrade({
      MerID: 'ABC',
      Timestamp: Math.floor(Date.now() / 1000),
      UsrMail: userEmail,
    }, 'credit_bind_query');
    
    if (!queryResult.success) {
      console.log('查詢失敗：', queryResult.message);
      return null;
    }
    
    const bindInfo = queryResult.message;
    
    // 2. 顯示綁定資訊
    if (bindInfo.CreditHash) {
      console.log('已綁定信用卡：');
      console.log('- Token:', bindInfo.CreditHash);
      console.log('- 卡號末四碼:', bindInfo.Card4No);
      console.log('- 綁定時間:', bindInfo.BindTime);
      
      // 3. 詢問是否要取消綁定（示範）
      const shouldCancel = false; // 在實際應用中，這會根據用戶輸入決定
      
      if (shouldCancel) {
        const cancelResult = await this.payuniApi.universalTrade({
          MerID: 'ABC',
          Timestamp: Math.floor(Date.now() / 1000),
          CreditHash: bindInfo.CreditHash,
        }, 'credit_bind_cancel');
        
        if (cancelResult.success) {
          console.log('綁定已取消');
        }
      }
      
      return bindInfo;
    } else {
      console.log('此用戶尚未綁定任何信用卡');
      return null;
    }
  }

  /**
   * 定期扣款範例
   * 使用綁定的信用卡進行訂閱或定期扣款
   */
  async recurringPayment(userEmail: string, amount: number): Promise<any> {
    console.log(`執行定期扣款 - 用戶: ${userEmail}, 金額: ${amount}`);
    
    // 1. 先查詢用戶的綁定信用卡
    const queryResult = await this.payuniApi.universalTrade({
      MerID: 'ABC',
      Timestamp: Math.floor(Date.now() / 1000),
      UsrMail: userEmail,
    }, 'credit_bind_query');
    
    if (!queryResult.success || !queryResult.message.CreditHash) {
      console.log('用戶尚未綁定信用卡，無法進行定期扣款');
      return {
        success: false,
        message: 'No credit card bound'
      };
    }
    
    const creditHash = queryResult.message.CreditHash;
    
    // 2. 使用綁定的卡片進行扣款
    const paymentResult = await this.payuniApi.universalTrade({
      MerID: 'ABC',
      MerTradeNo: 'recurring' + Date.now(),
      TradeAmt: amount,
      Timestamp: Math.floor(Date.now() / 1000),
      CreditHash: creditHash,
      ProdDesc: '月費訂閱',
    }, 'credit');
    
    if (paymentResult.success) {
      console.log('定期扣款成功');
      // 記錄扣款成功
      // await logRecurringPayment(userEmail, amount, paymentResult.message.TradeNo);
    } else {
      console.log('定期扣款失敗：', paymentResult.message);
      // 處理扣款失敗（例如：發送通知給用戶）
    }
    
    return paymentResult;
  }
}

// 使用範例
async function main() {
  const creditBind = new CreditBind();
  
  // 執行不同的信用卡綁定功能
  // await creditBind.creditBindQuery();         // 查詢綁定
  // await creditBind.creditBindCancel();        // 取消綁定
  
  // 使用綁定的信用卡扣款
  // await creditBind.payWithCreditHash('YOUR_CREDIT_HASH', 1000);
  
  // 首次綁定並扣款
  // const cardInfo = {
  //   cardNo: '4111111111111111',
  //   cardCVC: '123',
  //   cardExpired: '1225',
  //   email: 'customer@example.com'
  // };
  // await creditBind.firstBindAndPay(cardInfo, 500);
  
  // 管理用戶卡片
  // await creditBind.manageUserCards('customer@example.com');
  
  // 定期扣款
  // await creditBind.recurringPayment('customer@example.com', 299);
}

// 如果直接執行此檔案
if (require.main === module) {
  main().catch(console.error);
}