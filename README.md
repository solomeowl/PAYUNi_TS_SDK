# PAYUNi TypeScript SDK

[![npm version](https://badge.fury.io/js/payuni-ts-sdk.svg)](https://badge.fury.io/js/payuni-ts-sdk)
[![npm downloads](https://img.shields.io/npm/dm/payuni-ts-sdk.svg)](https://www.npmjs.com/package/payuni-ts-sdk)
[![GitHub license](https://img.shields.io/github/license/solomeowl/PAYUNi_TS_SDK.svg)](https://github.com/solomeowl/PAYUNi_TS_SDK/blob/main/LICENSE)
[![CI](https://github.com/solomeowl/PAYUNi_TS_SDK/actions/workflows/ci.yml/badge.svg)](https://github.com/solomeowl/PAYUNi_TS_SDK/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/node/v/payuni-ts-sdk.svg)](https://nodejs.org/)

> 非官方的 PAYUNi 金流服務 TypeScript/JavaScript SDK，提供完整的型別安全和現代化的 API 設計。

# 目錄
* [環境需求](#環境需求)
* [安裝](#安裝)
* [使用方式](#使用方式)

# 環境需求
* Node.js：>= 14.0.0
* TypeScript：>= 4.0.0

# 安裝
請使用 npm 或 yarn 安裝
```bash
npm install payuni-ts-sdk
```
或
```bash
yarn add payuni-ts-sdk
```

# 使用方式
* 正式區
```typescript
import { PayuniApi } from 'payuni-ts-sdk';

const payuniApi = new PayuniApi(merKey, merIV);
```
* 測試區
```typescript
import { PayuniApi } from 'payuni-ts-sdk';

const payuniApi = new PayuniApi(merKey, merIV, 't');
```
* API串接
```typescript
const result = await payuniApi.universalTrade(encryptInfo, mode, version);
```
* upp ReturnURL、NotifyURL接收到回傳參數後處理方式
```typescript
const result = payuniApi.resultProcess(requestData);
```
* 參數說明
  * `encryptInfo`
    * 參數詳細內容請參考[統一金流API串接文件](https://www.payuni.com.tw/docs/web/#/7/34)對應功能請求參數的EncryptInfo
  ```typescript
  const encryptInfo = {
    MerID: 'ABC',
    Timestamp: Math.floor(Date.now() / 1000),
    // ...其他參數
  };
  ```
  * 若要使用代理商功能請在encryptInfo裡多加上IsPlatForm參數且值給1
  ```typescript
  const encryptInfo = {
    IsPlatForm: 1,
    MerID: 'ABC',
    Timestamp: Math.floor(Date.now() / 1000),
    // ...其他參數
  };
  ```
  * `merKey`
    * 請登入PAYUNi平台檢視商店串接資訊取得 Hash Key
  * `merIV`
    * 請登入PAYUNi平台檢視商店串接資訊取得 Hash IV
  * `type` (非必填)
    * 連線測試區 => 't'
    * 連線正式區 => 不給該參數或給空值
  * `mode`
    * 整合式支付頁  => 'upp'
    * 虛擬帳號幕後  => 'atm'
    * 超商代碼幕後  => 'cvs'
    * 信用卡幕後　  => 'credit'
    * LINE Pay幕後 => 'linepay'
    * AFTEE幕後    => 'aftee_direct'
    * 交易查詢　 　 => 'trade_query'
    * 交易請退款 　 => 'trade_close'
    * 交易取消授權  => 'trade_cancel'
    * 信用卡Token(約定) => 'credit_bind_query'
    * 信用卡Token取消(約定/記憶卡號) => 'credit_bind_cancel'
    * 交易取消超商代碼(CVS) => 'cancel_cvs'
    * 後支付確認(AFTEE) => 'trade_confirm_aftee'
    * 愛金卡退款(ICASH) => 'trade_refund_icash'
    * 後支付退款(AFTEE) => 'trade_refund_aftee'
    * LINE Pay退款(LINE) => 'trade_refund_linepay'

  * `version` (非必填)
    * 所呼叫API的版本號，預設1.0(LINE Pay預設為1.1)
    * 若需呼叫其他版本號，該參數請給字串，e.g. `payuniApi.universalTrade(encryptInfo, 'trade_query', '2.0');`
    * 若需呼叫新版號請參考[統一金流API串接文件](https://www.payuni.com.tw/docs/web/#/7/34)對應功能請求參數的Version備註

## 使用範例

### TypeScript
```typescript
import { PayuniApi } from 'payuni-ts-sdk';

const merKey = '12345678901234567890123456789012';
const merIV = '1234567890123456';
const payuniApi = new PayuniApi(merKey, merIV);

const encryptInfo = {
  MerID: 'ABC',
  TradeNo: '16614190477810373246',
  Timestamp: Math.floor(Date.now() / 1000)
};

const result = await payuniApi.universalTrade(encryptInfo, 'trade_query');
console.log(result);
```

### JavaScript
```javascript
const { PayuniApi } = require('payuni-ts-sdk');

const merKey = '12345678901234567890123456789012';
const merIV = '1234567890123456';
const payuniApi = new PayuniApi(merKey, merIV);

const encryptInfo = {
  MerID: 'ABC',
  TradeNo: '16614190477810373246',
  Timestamp: Math.floor(Date.now() / 1000)
};

payuniApi.universalTrade(encryptInfo, 'trade_query')
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  });
```

* 其餘請參考[範例](https://github.com/solomeowl/PAYUNi_TS_SDK/tree/main/examples)

# LICENSE
MIT License

Copyright (c) 2025 solomeowl

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.