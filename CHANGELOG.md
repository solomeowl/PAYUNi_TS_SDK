# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-09-01

### Fixed
- **Error Message Display** - Fixed `[object Object]` error messages to show proper error descriptions
- **Response Processing** - Improved error handling in API response processing

## [1.0.0] - 2025-09-01

### Added

#### Core Features
- **PayuniApi** - Main API class for PAYUNi integration
- **AES-256-GCM Encryption** - Complete encryption/decryption implementation matching official SDKs
- **All Payment Methods** - Support for 17 different payment and transaction modes:
  - `upp` - Universal Payment Page (integrated payment)
  - `atm` - ATM Virtual Account
  - `cvs` - Convenience Store Code
  - `credit` - Credit Card (direct)
  - `linepay` - LINE Pay
  - `aftee_direct` - AFTEE Buy-Now-Pay-Later
  - `trade_query` - Transaction Query
  - `trade_close` - Transaction Refund
  - `trade_cancel` - Cancel Authorization
  - `credit_bind_query` - Credit Card Token Query
  - `credit_bind_cancel` - Credit Card Token Cancel
  - `cancel_cvs` - Cancel CVS Code
  - `trade_confirm_aftee` - AFTEE Confirmation
  - `trade_refund_icash` - iCash Refund
  - `trade_refund_aftee` - AFTEE Refund
  - `trade_refund_linepay` - LINE Pay Refund

#### Environment Support
- **Production Environment** - `https://api.payuni.com.tw/api/`
- **Sandbox Environment** - `https://sandbox-api.payuni.com.tw/api/`
- **Auto Environment Switching** based on initialization parameter

#### Developer Experience
- **TypeScript Support** - Full type safety with comprehensive interfaces
- **Complete Documentation** - README, examples, and inline documentation
- **Extensive Examples** - 5+ example files covering all use cases
- **Error Handling** - Comprehensive validation and error reporting

#### Examples Structure (matching official SDKs)
- `examples/payment/Payment.ts` - Payment methods (UPP, credit, ATM, CVS)
- `examples/trade/Trade.ts` - Transaction management (query, refund, cancel)
- `examples/credit_bind/CreditBind.ts` - Credit card token management
- `examples/express-integration.ts` - Express.js web integration
- `examples/basic-usage.ts` - Quick start guide

#### Security & Validation
- **Field Validation** - Mode-specific parameter validation
- **Hash Verification** - SHA256 hash generation and verification
- **Data Encryption** - URL-encoded parameter encryption
- **Type Safety** - Comprehensive TypeScript interfaces

#### Testing & Quality
- **Unit Tests** - 48 comprehensive test cases with 81.53% coverage
- **Jest Framework** - Modern testing with mocking support
- **ESLint Configuration** - Code quality and consistency
- **GitHub Actions** - CI/CD pipeline for testing and deployment

#### Platform Features
- **Agent/Platform Mode** - Support for IsPlatForm parameter
- **Version Management** - API version handling (default 1.0, LINE Pay 1.1)
- **Batch Operations** - Support for batch transaction queries
- **Return/Notify Processing** - Complete webhook handling

### Technical Details

#### Encryption Implementation
- Matching official PHP/NET SDK encryption exactly
- AES-256-GCM with authentication tag
- Base64 + hex encoding format
- Consistent parameter sorting

#### HTTP Client
- Axios-based HTTP client
- Proper Content-Type headers
- User-Agent: PRESCOSDKAPI
- Timeout configuration

#### Development Setup
- Node.js >= 14.0.0
- TypeScript >= 4.0.0
- Modern ESM/CommonJS compatibility
- Comprehensive build pipeline

### Dependencies

#### Production
- `axios` ^1.11.0 - HTTP client
- `crypto-js` ^4.2.0 - Cryptographic functions

#### Development
- `typescript` ^5.9.2
- `jest` ^29.7.0
- `eslint` ^9.34.0
- Plus comprehensive TypeScript tooling

### License
MIT License - Free for commercial and personal use

### Repository
GitHub: https://github.com/solomeowl/PAYUNi_TS_SDK