# PAYUNi TypeScript SDK 範例

此目錄包含 PAYUNi TypeScript SDK 的使用範例，結構參考官方 PHP/NET SDK。

## 目錄結構

```
examples/
├── payment/          # 支付功能範例
│   └── Payment.ts    # 各種支付方式（UPP、信用卡、ATM、超商代碼）
├── trade/           # 交易管理範例
│   └── Trade.ts     # 查詢、退款、取消授權等
├── credit_bind/     # 信用卡綁定範例
│   └── CreditBind.ts # Token 綁定、查詢、取消
├── basic-usage.ts    # 基本使用範例
├── express-integration.ts # Express.js 整合範例
└── payment-methods.ts # 各種支付方式詳細範例
```

## 快速開始

### 1. 設定金鑰

在使用前，請先設定您的商店金鑰：

```typescript
const merKey = '您的_HASH_KEY';  // 32 位元
const merIV = '您的_HASH_IV';    // 16 位元

// 正式環境
const payuniApi = new PayuniApi(merKey, merIV);

// 測試環境
const payuniApi = new PayuniApi(merKey, merIV, 't');
```

### 2. 支付範例 (payment/)

```typescript
import { Payment } from './payment/Payment';

const payment = new Payment();

// UPP 整合式支付頁
await payment.upp();

// 信用卡幕後扣款
await payment.credit();

// ATM 虛擬帳號
await payment.atm();

// 超商代碼
await payment.cvs();
```

### 3. 交易管理範例 (trade/)

```typescript
import { Trade } from './trade/Trade';

const trade = new Trade();

// 查詢交易
await trade.tradeQuery();

// 請求退款
await trade.tradeClose();

// 取消授權
await trade.tradeCancel();
```

### 4. 信用卡綁定範例 (credit_bind/)

```typescript
import { CreditBind } from './credit_bind/CreditBind';

const creditBind = new CreditBind();

// 查詢綁定的信用卡
await creditBind.creditBindQuery();

// 使用綁定的信用卡扣款
await creditBind.payWithCreditHash('CREDIT_HASH', 1000);

// 定期扣款
await creditBind.recurringPayment('user@example.com', 299);
```

## 執行範例

### TypeScript 直接執行

```bash
# 安裝 ts-node
npm install -g ts-node

# 執行範例
ts-node examples/payment/Payment.ts
ts-node examples/trade/Trade.ts
ts-node examples/credit_bind/CreditBind.ts
```

### 編譯後執行

```bash
# 編譯專案
npm run build

# 執行編譯後的 JavaScript
node dist/examples/payment/Payment.js
```

## Express.js 整合

查看 `express-integration.ts` 了解如何在 Express 應用中整合：

```typescript
import express from 'express';
import { PayuniApi } from 'payuni-ts-sdk';

const app = express();
const payuniApi = new PayuniApi(merKey, merIV, 't');

// 建立支付
app.post('/create-payment', async (req, res) => {
  const result = await payuniApi.universalTrade(encryptInfo, 'upp');
  res.send(result.message);
});

// 處理回傳
app.post('/payment/return', (req, res) => {
  const result = payuniApi.resultProcess(req.body);
  // 處理結果...
});
```

## 重要提醒

1. **測試環境**：開發時請使用測試環境（加上 `'t'` 參數）
2. **金鑰安全**：不要將真實金鑰寫在程式碼中，應使用環境變數
3. **錯誤處理**：實際應用中請加入完整的錯誤處理
4. **日誌記錄**：建議記錄所有交易請求和回應
5. **時間戳記**：Timestamp 使用 Unix 時間戳（秒）

## 環境變數設定

建議使用環境變數管理敏感資訊：

```bash
# .env 檔案
PAYUNI_MER_KEY=your_32_char_key
PAYUNI_MER_IV=your_16_char_iv
PAYUNI_MER_ID=your_merchant_id
PAYUNI_ENV=t  # 't' 為測試環境，留空為正式環境
```

```typescript
import * as dotenv from 'dotenv';
dotenv.config();

const payuniApi = new PayuniApi(
  process.env.PAYUNI_MER_KEY!,
  process.env.PAYUNI_MER_IV!,
  process.env.PAYUNI_ENV as any
);
```

## 更多資訊

- [PAYUNi API 文件](https://www.payuni.com.tw/docs/web/#/7/34)
- [官方 PHP SDK](https://github.com/payuni/PHP_SDK)
- [官方 .NET SDK](https://github.com/payuni/NET_SDK)