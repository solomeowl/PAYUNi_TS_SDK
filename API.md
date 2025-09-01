# PAYUNi TypeScript SDK API Reference

## Table of Contents

- [PayuniApi Class](#payuniapi-class)
- [CryptoHelper Class](#cryptohelper-class)
- [Interfaces](#interfaces)
- [Types](#types)
- [Examples](#examples)

## PayuniApi Class

Main class for PAYUNi payment integration.

### Constructor

```typescript
new PayuniApi(merKey: string, merIV: string, type?: EnvironmentType)
```

**Parameters:**
- `merKey` - 32-character Hash Key from PAYUNi merchant dashboard
- `merIV` - 16-character Hash IV from PAYUNi merchant dashboard  
- `type` - Optional environment type ('t' for sandbox, empty for production)

**Example:**
```typescript
// Production
const payuniApi = new PayuniApi('your_32_char_key', 'your_16_char_iv');

// Sandbox
const payuniApi = new PayuniApi('your_32_char_key', 'your_16_char_iv', 't');
```

### Methods

#### universalTrade()

Main method for all API operations.

```typescript
async universalTrade(
  encryptInfo: EncryptInfo,
  mode: PaymentMode,
  version?: string
): Promise<ResultModel>
```

**Parameters:**
- `encryptInfo` - Payment/transaction data object
- `mode` - Payment method or operation type
- `version` - API version (default: '1.0', LINE Pay: '1.1')

**Returns:** Promise<ResultModel>

**Payment Modes:**

| Mode | Description | Required Fields |
|------|-------------|-----------------|
| `upp` | Universal Payment Page | MerID, Timestamp, MerTradeNo, TradeAmt, ReturnURL, NotifyURL |
| `atm` | ATM Virtual Account | MerID, Timestamp, MerTradeNo, TradeAmt |
| `cvs` | Convenience Store | MerID, Timestamp, MerTradeNo, TradeAmt |
| `credit` | Credit Card Direct | MerID, Timestamp, MerTradeNo, TradeAmt, CardNo/CreditHash |
| `linepay` | LINE Pay | MerID, Timestamp, MerTradeNo, TradeAmt |
| `aftee_direct` | AFTEE | MerID, Timestamp, MerTradeNo, TradeAmt |
| `trade_query` | Query Transaction | MerID, Timestamp, TradeNo |
| `trade_close` | Request Refund | MerID, Timestamp, TradeNo, TradeAmt |
| `trade_cancel` | Cancel Authorization | MerID, Timestamp, TradeNo |

**Example:**
```typescript
const result = await payuniApi.universalTrade({
  MerID: 'YOUR_MERCHANT_ID',
  MerTradeNo: 'ORDER_' + Date.now(),
  TradeAmt: 1000,
  Timestamp: Math.floor(Date.now() / 1000),
  ReturnURL: 'https://yoursite.com/return',
  NotifyURL: 'https://yoursite.com/notify'
}, 'upp');
```

#### resultProcess()

Process response from ReturnURL or NotifyURL.

```typescript
resultProcess(requestData: any): ResultModel
```

**Parameters:**
- `requestData` - Response data from PAYUNi callback

**Returns:** ResultModel

**Example:**
```typescript
// In your Express route
app.post('/payment/return', (req, res) => {
  const result = payuniApi.resultProcess(req.body);
  
  if (result.success) {
    // Payment successful
    const transactionData = result.message;
    console.log('Payment successful:', transactionData);
  } else {
    // Payment failed
    console.log('Payment failed:', result.message);
  }
});
```

## CryptoHelper Class

Handles encryption, decryption, and hash operations.

### Constructor

```typescript
new CryptoHelper(merKey: string, merIV: string)
```

### Methods

#### encrypt()

Encrypt data using AES-256-GCM.

```typescript
encrypt(data: Record<string, any>): string
```

#### decrypt()

Decrypt encrypted hex string.

```typescript
decrypt(encryptedHex: string): Record<string, any>
```

#### generateHash()

Generate SHA256 hash for verification.

```typescript
generateHash(encryptStr: string): string
```

#### verifyHash()

Verify hash integrity.

```typescript
verifyHash(encryptStr: string, hash: string): boolean
```

## Interfaces

### EncryptInfo

Main data structure for payment information.

```typescript
interface EncryptInfo {
  // Required for all operations
  MerID: string;
  Timestamp: number | string;
  
  // Payment operations
  MerTradeNo?: string;      // Merchant trade number
  TradeAmt?: number | string; // Transaction amount
  TradeNo?: string;         // PAYUNi transaction number
  ProdDesc?: string;        // Product description
  UsrMail?: string;         // User email
  
  // UPP specific
  ReturnURL?: string;       // Return URL after payment
  NotifyURL?: string;       // Notification webhook URL
  BackURL?: string;         // Back button URL
  
  // Credit card
  CardNo?: string;          // Credit card number
  CardCVC?: string;         // CVC code
  CardExpired?: string;     // Expiry date (YYMM)
  CreditHash?: string;      // Saved card token
  CreditInstallment?: string; // Installment periods
  
  // ATM
  BankType?: string;        // Bank code
  ExpireDate?: string;      // Expiry date (YYYYMMDD)
  
  // CVS
  CVSType?: string;         // Store type (ALL, SEVEN, FAMILY, etc.)
  
  // Platform/Agent
  IsPlatForm?: number | string; // 1 to enable platform mode
  
  // Additional fields
  [key: string]: any;       // Allow additional parameters
}
```

### ResultModel

Standard response format.

```typescript
interface ResultModel {
  success: boolean;         // Operation success status
  message: string | object | any; // Result data or error message
}
```

### ApiResponse

PAYUNi API response format.

```typescript
interface ApiResponse {
  Status: string;           // SUCCESS, ERROR, etc.
  Message: string;          // Response message
  Version?: string;         // API version
  EncryptInfo?: string;     // Encrypted response data
  HashInfo?: string;        // Hash for verification
  [key: string]: any;       // Additional response fields
}
```

## Types

### PaymentMode

Available payment methods and operations.

```typescript
type PaymentMode = 
  | 'upp'                    // Universal Payment Page
  | 'atm'                    // ATM Virtual Account
  | 'cvs'                    // Convenience Store
  | 'credit'                 // Credit Card
  | 'linepay'                // LINE Pay
  | 'aftee_direct'           // AFTEE
  | 'trade_query'            // Transaction Query
  | 'trade_close'            // Request Refund
  | 'trade_cancel'           // Cancel Authorization
  | 'credit_bind_query'      // Credit Token Query
  | 'credit_bind_cancel'     // Credit Token Cancel
  | 'cancel_cvs'             // Cancel CVS Code
  | 'trade_confirm_aftee'    // AFTEE Confirmation
  | 'trade_refund_icash'     // iCash Refund
  | 'trade_refund_aftee'     // AFTEE Refund
  | 'trade_refund_linepay';  // LINE Pay Refund
```

### EnvironmentType

Environment selection.

```typescript
type EnvironmentType = 't' | '';
```

- `'t'` - Sandbox environment
- `''` - Production environment

## Error Handling

The SDK provides comprehensive error handling:

```typescript
const result = await payuniApi.universalTrade(encryptInfo, mode);

if (!result.success) {
  console.error('Operation failed:', result.message);
  
  // Common error types:
  // - Validation errors (missing required fields)
  // - API errors (returned by PAYUNi)
  // - Network errors (connection issues)
  // - Hash verification failures
}
```

## Environment Variables

Recommended environment variable usage:

```typescript
const payuniApi = new PayuniApi(
  process.env.PAYUNI_MER_KEY!,
  process.env.PAYUNI_MER_IV!,
  process.env.PAYUNI_ENV as EnvironmentType
);
```

## Examples

See the `/examples` directory for complete implementation examples:

- `examples/payment/Payment.ts` - Payment methods
- `examples/trade/Trade.ts` - Transaction management  
- `examples/credit_bind/CreditBind.ts` - Card token management
- `examples/express-integration.ts` - Web application integration

## Version Compatibility

- **Default Version**: 1.0
- **LINE Pay Default**: 1.1  
- **Custom Versions**: Specify as string parameter

```typescript
// Use custom version
await payuniApi.universalTrade(encryptInfo, 'trade_query', '2.0');
```

## Platform/Agent Mode

Enable platform mode for agent operations:

```typescript
const encryptInfo: EncryptInfo = {
  IsPlatForm: 1,  // Enable platform mode
  MerID: 'MERCHANT_ID',
  // ... other parameters
};
```

## Rate Limiting

Be mindful of API rate limits. For batch operations, add delays:

```typescript
// Example batch processing with delay
for (const item of items) {
  const result = await payuniApi.universalTrade(item.data, item.mode);
  
  // Add delay between requests
  await new Promise(resolve => setTimeout(resolve, 100));
}
```