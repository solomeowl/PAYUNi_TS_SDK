import express from 'express';
import { PayuniApi } from '../src';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化 PAYUNi SDK
const merKey = process.env.PAYUNI_KEY || '12345678901234567890123456789012';
const merIV = process.env.PAYUNI_IV || '1234567890123456';
const payuniApi = new PayuniApi(merKey, merIV, 't'); // 使用測試環境

// 建立支付頁面
app.post('/create-payment', async (req, res) => {
  try {
    const { amount, productDesc, email } = req.body;
    
    const tradeNo = 'TRADE' + Date.now();
    
    const result = await payuniApi.universalTrade({
      MerID: 'YOUR_MERCHANT_ID',
      MerTradeNo: tradeNo,
      TradeAmt: amount,
      Timestamp: Math.floor(Date.now() / 1000),
      ProdDesc: productDesc,
      UsrMail: email,
      ReturnURL: 'https://yoursite.com/payment/return',
      NotifyURL: 'https://yoursite.com/payment/notify',
      BackURL: 'https://yoursite.com/payment/back'
    }, 'upp');
    
    if (result.success && typeof result.message === 'string') {
      // 返回 HTML 表單給前端
      res.send(result.message);
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// 處理支付返回 (ReturnURL)
app.post('/payment/return', (req, res) => {
  try {
    const result = payuniApi.resultProcess(req.body);
    
    if (result.success) {
      // 支付成功，顯示成功頁面
      res.send(`
        <html>
          <body>
            <h1>支付成功！</h1>
            <p>交易資訊：${JSON.stringify(result.message)}</p>
            <a href="/">返回首頁</a>
          </body>
        </html>
      `);
    } else {
      // 支付失敗
      res.send(`
        <html>
          <body>
            <h1>支付失敗</h1>
            <p>錯誤訊息：${result.message}</p>
            <a href="/">返回首頁</a>
          </body>
        </html>
      `);
    }
  } catch (error) {
    res.status(500).send('處理支付結果時發生錯誤');
  }
});

// 處理支付通知 (NotifyURL)
app.post('/payment/notify', async (req, res) => {
  try {
    const result = payuniApi.resultProcess(req.body);
    
    if (result.success) {
      // 處理成功的支付
      const paymentData = result.message;
      console.log('收到支付通知:', paymentData);
      
      // 在這裡更新您的訂單狀態
      // await updateOrderStatus(paymentData.TradeNo, 'paid');
      
      res.send('OK');
    } else {
      console.error('支付通知處理失敗:', result.message);
      res.status(400).send('FAIL');
    }
  } catch (error) {
    console.error('處理通知時發生錯誤:', error);
    res.status(500).send('ERROR');
  }
});

// 查詢交易狀態
app.get('/payment/query/:tradeNo', async (req, res) => {
  try {
    const { tradeNo } = req.params;
    
    const result = await payuniApi.universalTrade({
      MerID: 'YOUR_MERCHANT_ID',
      TradeNo: tradeNo,
      Timestamp: Math.floor(Date.now() / 1000)
    }, 'trade_query');
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Query failed' });
  }
});

// 退款
app.post('/payment/refund', async (req, res) => {
  try {
    const { tradeNo, amount, reason } = req.body;
    
    const result = await payuniApi.universalTrade({
      MerID: 'YOUR_MERCHANT_ID',
      TradeNo: tradeNo,
      TradeAmt: amount,
      Timestamp: Math.floor(Date.now() / 1000),
      CloseReason: reason
    }, 'trade_close');
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Refund failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PAYUNi payment server running on port ${PORT}`);
});