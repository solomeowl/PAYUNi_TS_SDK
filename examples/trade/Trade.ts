/**
 * 交易管理功能範例
 * 參考官方 PHP/NET SDK examples/trade/Trade.php
 */

import { PayuniApi, EncryptInfo, BatchQueryResult } from '../../src';

export class Trade {
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
   * 交易查詢
   * 查詢特定交易的狀態和詳細資訊
   */
  async tradeQuery(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      TradeNo: '16614190477810373246', // PAYUNi 交易編號
      Timestamp: Math.floor(Date.now() / 1000),
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'trade_query');
    console.log('交易查詢結果：', result);
    
    if (result.success) {
      const tradeInfo = result.message;
      console.log('交易狀態：', tradeInfo.Status);
      console.log('交易金額：', tradeInfo.TradeAmt);
      // 處理其他交易資訊...
    }
    
    return result;
  }

  /**
   * 交易請退款
   * 對已完成的交易進行退款
   */
  async tradeClose(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      TradeNo: '16614190477810373246', // 要退款的交易編號
      TradeAmt: 100, // 退款金額（可部分退款）
      Timestamp: Math.floor(Date.now() / 1000),
      CloseReason: '客戶要求退款', // 退款原因
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'trade_close');
    console.log('退款結果：', result);
    
    if (result.success) {
      console.log('退款成功');
    } else {
      console.log('退款失敗：', result.message);
    }
    
    return result;
  }

  /**
   * 交易取消授權
   * 取消尚未請款的信用卡授權
   */
  async tradeCancel(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      TradeNo: '16614190477810373246', // 要取消的交易編號
      Timestamp: Math.floor(Date.now() / 1000),
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'trade_cancel');
    console.log('取消授權結果：', result);
    return result;
  }

  /**
   * 愛金卡退款 (ICASH)
   * 針對愛金卡支付的交易進行退款
   */
  async tradeRefundIcash(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      TradeNo: '16614190477810373246',
      TradeAmt: 100, // 退款金額
      Timestamp: Math.floor(Date.now() / 1000),
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'trade_refund_icash');
    console.log('愛金卡退款結果：', result);
    return result;
  }

  /**
   * AFTEE 後支付退款
   * 針對 AFTEE 後支付的交易進行退款
   */
  async tradeRefundAftee(): Promise<any> {
    const encryptInfo: EncryptInfo = {
      MerID: 'ABC',
      TradeNo: '16614190477810373246',
      TradeAmt: 100, // 退款金額
      Timestamp: Math.floor(Date.now() / 1000),
      // ... 其他選填參數
    };
    
    const result = await this.payuniApi.universalTrade(encryptInfo, 'trade_refund_aftee');
    console.log('AFTEE 退款結果：', result);
    return result;
  }

  /**
   * 批次查詢交易
   * 查詢多筆交易狀態（示範用）
   */
  async batchTradeQuery(tradeNos: string[]): Promise<BatchQueryResult[]> {
    const results: BatchQueryResult[] = [];
    
    for (const tradeNo of tradeNos) {
      const encryptInfo: EncryptInfo = {
        MerID: 'ABC',
        TradeNo: tradeNo,
        Timestamp: Math.floor(Date.now() / 1000),
      };
      
      const result = await this.payuniApi.universalTrade(encryptInfo, 'trade_query');
      results.push({
        tradeNo,
        result
      });
      
      // 避免太頻繁的請求
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * 查詢交易並決定是否退款
   * 實務應用範例
   */
  async queryAndRefund(tradeNo: string, shouldRefund: boolean = false): Promise<any> {
    // 先查詢交易狀態
    const queryResult = await this.payuniApi.universalTrade({
      MerID: 'ABC',
      TradeNo: tradeNo,
      Timestamp: Math.floor(Date.now() / 1000),
    }, 'trade_query');
    
    if (!queryResult.success) {
      console.log('查詢失敗：', queryResult.message);
      return queryResult;
    }
    
    const tradeInfo = queryResult.message;
    console.log('交易狀態：', tradeInfo.Status);
    
    // 如果交易成功且需要退款
    if (tradeInfo.Status === 'SUCCESS' && shouldRefund) {
      console.log('執行退款...');
      
      const refundResult = await this.payuniApi.universalTrade({
        MerID: 'ABC',
        TradeNo: tradeNo,
        TradeAmt: tradeInfo.TradeAmt, // 全額退款
        Timestamp: Math.floor(Date.now() / 1000),
        CloseReason: '系統自動退款',
      }, 'trade_close');
      
      return refundResult;
    }
    
    return queryResult;
  }
}

// 使用範例
async function main() {
  const trade = new Trade();
  
  // 執行不同的交易管理功能
  // await trade.tradeQuery();           // 查詢交易
  // await trade.tradeClose();           // 請求退款
  // await trade.tradeCancel();          // 取消授權
  // await trade.tradeRefundIcash();     // 愛金卡退款
  // await trade.tradeRefundAftee();     // AFTEE 退款
  
  // 批次查詢
  // const tradeNos = ['12345', '67890'];
  // await trade.batchTradeQuery(tradeNos);
  
  // 查詢並退款
  // await trade.queryAndRefund('16614190477810373246', true);
}

// 如果直接執行此檔案
if (require.main === module) {
  main().catch(console.error);
}