import { PayuniApi } from '../src';

// 初始化 SDK
const merKey = '12345678901234567890123456789012'; // 請替換為您的 Hash Key
const merIV = '1234567890123456'; // 請替換為您的 Hash IV

// 正式環境
const payuniApi = new PayuniApi(merKey, merIV);

// 測試環境
// const payuniApi = new PayuniApi(merKey, merIV, 't');

async function main() {
  // 範例 1: 交易查詢
  console.log('=== 交易查詢範例 ===');
  const queryResult = await payuniApi.universalTrade({
    MerID: 'ABC',
    TradeNo: '16614190477810373246',
    Timestamp: Math.floor(Date.now() / 1000)
  }, 'trade_query');
  
  console.log('查詢結果:', queryResult);

  // 範例 2: 建立信用卡支付
  console.log('\n=== 信用卡支付範例 ===');
  const creditPayment = await payuniApi.universalTrade({
    MerID: 'ABC',
    MerTradeNo: 'TEST' + Date.now(),
    TradeAmt: 1000,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: '測試商品',
    UsrMail: 'test@example.com',
    ReturnURL: 'https://yoursite.com/return',
    NotifyURL: 'https://yoursite.com/notify',
    CardNo: '4111111111111111',
    CardCVC: '123',
    CardExpired: '1225'
  }, 'credit');
  
  console.log('信用卡支付結果:', creditPayment);

  // 範例 3: 建立 UPP 整合式支付頁
  console.log('\n=== UPP 整合式支付頁範例 ===');
  const uppPayment = await payuniApi.universalTrade({
    MerID: 'ABC',
    MerTradeNo: 'UPP' + Date.now(),
    TradeAmt: 2000,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: '測試商品 - UPP',
    UsrMail: 'customer@example.com',
    ReturnURL: 'https://yoursite.com/return',
    NotifyURL: 'https://yoursite.com/notify',
    BackURL: 'https://yoursite.com/back'
  }, 'upp');
  
  // UPP 會返回 HTML 表單
  if (uppPayment.success && typeof uppPayment.message === 'string') {
    console.log('UPP HTML 表單已生成（可在瀏覽器中提交）');
    // 在實際應用中，您會將此 HTML 返回給前端瀏覽器
  }

  // 範例 4: 處理回傳結果
  console.log('\n=== 處理回傳結果範例 ===');
  const mockReturnData = {
    Status: 'SUCCESS',
    Message: '交易成功',
    EncryptInfo: 'encrypted_data_here',
    HashInfo: 'hash_info_here'
  };
  
  const processedResult = payuniApi.resultProcess(mockReturnData);
  console.log('處理結果:', processedResult);
}

// 執行範例
main().catch(console.error);