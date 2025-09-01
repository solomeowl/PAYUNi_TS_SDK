import { PayuniApi, EncryptInfo } from '../src';

// 初始化 SDK (測試環境)
const payuniApi = new PayuniApi(
  '12345678901234567890123456789012',
  '1234567890123456',
  't'
);

const MerID = 'YOUR_MERCHANT_ID';

// 1. 虛擬帳號 (ATM) 支付
async function createATMPayment() {
  const encryptInfo: EncryptInfo = {
    MerID,
    MerTradeNo: 'ATM' + Date.now(),
    TradeAmt: 1000,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: 'ATM 測試商品',
    UsrMail: 'customer@example.com',
    BankType: '004', // 銀行代碼
    ExpireDate: '20241231' // 過期日期
  };
  
  const result = await payuniApi.universalTrade(encryptInfo, 'atm');
  console.log('ATM 支付結果:', result);
  return result;
}

// 2. 超商代碼 (CVS) 支付
async function createCVSPayment() {
  const encryptInfo: EncryptInfo = {
    MerID,
    MerTradeNo: 'CVS' + Date.now(),
    TradeAmt: 500,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: '超商代碼測試',
    UsrMail: 'customer@example.com',
    CVSType: 'ALL', // ALL, SEVEN, FAMILY, OK, HILIFE
    ExpireDate: '20241231'
  };
  
  const result = await payuniApi.universalTrade(encryptInfo, 'cvs');
  console.log('超商代碼結果:', result);
  return result;
}

// 3. LINE Pay 支付
async function createLinePayPayment() {
  const encryptInfo: EncryptInfo = {
    MerID,
    MerTradeNo: 'LINE' + Date.now(),
    TradeAmt: 1500,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: 'LINE Pay 測試商品',
    UsrMail: 'customer@example.com',
    ReturnURL: 'https://yoursite.com/linepay/return',
    NotifyURL: 'https://yoursite.com/linepay/notify'
  };
  
  // LINE Pay 預設使用 version 1.1
  const result = await payuniApi.universalTrade(encryptInfo, 'linepay');
  console.log('LINE Pay 結果:', result);
  return result;
}

// 4. 信用卡記憶卡號/Token 支付
async function createTokenPayment() {
  const encryptInfo: EncryptInfo = {
    MerID,
    MerTradeNo: 'TOKEN' + Date.now(),
    TradeAmt: 2000,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: 'Token 支付測試',
    UsrMail: 'customer@example.com',
    CreditHash: 'YOUR_SAVED_CREDIT_HASH', // 使用之前儲存的 CreditHash
    CreditInstallment: '0' // 分期期數，0 為不分期
  };
  
  const result = await payuniApi.universalTrade(encryptInfo, 'credit');
  console.log('Token 支付結果:', result);
  return result;
}

// 5. AFTEE 後支付
async function createAFTEEPayment() {
  const encryptInfo: EncryptInfo = {
    MerID,
    MerTradeNo: 'AFTEE' + Date.now(),
    TradeAmt: 3000,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: 'AFTEE 後支付測試',
    UsrMail: 'customer@example.com',
    ReturnURL: 'https://yoursite.com/aftee/return',
    NotifyURL: 'https://yoursite.com/aftee/notify'
  };
  
  const result = await payuniApi.universalTrade(encryptInfo, 'aftee_direct');
  console.log('AFTEE 支付結果:', result);
  return result;
}

// 6. 查詢信用卡 Token
async function queryCreditToken() {
  const encryptInfo: EncryptInfo = {
    MerID,
    Timestamp: Math.floor(Date.now() / 1000),
    UsrMail: 'customer@example.com' // 查詢特定用戶的 Token
  };
  
  const result = await payuniApi.universalTrade(encryptInfo, 'credit_bind_query');
  console.log('信用卡 Token 查詢結果:', result);
  return result;
}

// 7. 取消信用卡 Token
async function cancelCreditToken() {
  const encryptInfo: EncryptInfo = {
    MerID,
    Timestamp: Math.floor(Date.now() / 1000),
    CreditHash: 'YOUR_CREDIT_HASH_TO_CANCEL'
  };
  
  const result = await payuniApi.universalTrade(encryptInfo, 'credit_bind_cancel');
  console.log('取消 Token 結果:', result);
  return result;
}

// 8. 取消超商代碼
async function cancelCVSCode() {
  const encryptInfo: EncryptInfo = {
    MerID,
    TradeNo: 'YOUR_TRADE_NO',
    Timestamp: Math.floor(Date.now() / 1000)
  };
  
  const result = await payuniApi.universalTrade(encryptInfo, 'cancel_cvs');
  console.log('取消超商代碼結果:', result);
  return result;
}

// 9. 各種退款操作
async function refundOperations() {
  const timestamp = Math.floor(Date.now() / 1000);
  
  // ICASH 愛金卡退款
  const icashRefund = await payuniApi.universalTrade({
    MerID,
    TradeNo: 'ICASH_TRADE_NO',
    TradeAmt: 100,
    Timestamp: timestamp
  }, 'trade_refund_icash');
  console.log('ICASH 退款結果:', icashRefund);
  
  // AFTEE 退款
  const afteeRefund = await payuniApi.universalTrade({
    MerID,
    TradeNo: 'AFTEE_TRADE_NO',
    TradeAmt: 500,
    Timestamp: timestamp
  }, 'trade_refund_aftee');
  console.log('AFTEE 退款結果:', afteeRefund);
  
  // LINE Pay 退款
  const linePayRefund = await payuniApi.universalTrade({
    MerID,
    TradeNo: 'LINEPAY_TRADE_NO',
    TradeAmt: 300,
    Timestamp: timestamp
  }, 'trade_refund_linepay');
  console.log('LINE Pay 退款結果:', linePayRefund);
}

// 執行範例
async function runExamples() {
  try {
    console.log('=== PAYUNi 各種支付方式範例 ===\n');
    
    // 執行各種支付方式
    // await createATMPayment();
    // await createCVSPayment();
    // await createLinePayPayment();
    // await createAFTEEPayment();
    // await queryCreditToken();
    // await refundOperations();
    
    console.log('\n請根據需要取消註解來執行特定的支付方式範例');
  } catch (error) {
    console.error('執行範例時發生錯誤:', error);
  }
}

runExamples();