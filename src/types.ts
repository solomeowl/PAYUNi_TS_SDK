export interface EncryptInfo {
  MerID: string;
  Timestamp: number | string;
  MerTradeNo?: string;
  TradeAmt?: number | string;
  TradeNo?: string;
  ProdDesc?: string;
  UsrMail?: string;
  ReturnURL?: string;
  NotifyURL?: string;
  BackURL?: string;
  IsPlatForm?: number | string;
  
  // Credit card fields
  CardNo?: string;
  CardCVC?: string;
  CardExpired?: string;
  CreditHash?: string;
  CreditInstallment?: string;
  
  // ATM fields
  BankType?: string;
  ExpireDate?: string;
  
  // CVS fields
  CVSType?: string;
  
  // Other payment fields
  PayType?: string;
  PaymentType?: string;
  [key: string]: any;
}

export interface ParameterModel {
  MerID: string;
  Version: string;
  EncryptInfo: string;
  HashInfo: string;
  Status?: string;
  IsPlatForm?: string;
}

export interface ApiResponse {
  Status: string;
  Message: string;
  Version?: string;
  EncryptInfo?: string;
  HashInfo?: string;
  [key: string]: any;
}

export interface ResultModel {
  success: boolean;
  message: string | object | any;
}

export type PaymentMode = 
  | 'upp'
  | 'atm'
  | 'cvs'
  | 'credit'
  | 'linepay'
  | 'aftee_direct'
  | 'trade_query'
  | 'trade_close'
  | 'trade_cancel'
  | 'credit_bind_query'
  | 'credit_bind_cancel'
  | 'cancel_cvs'
  | 'trade_confirm_aftee'
  | 'trade_refund_icash'
  | 'trade_refund_aftee'
  | 'trade_refund_linepay';

export type EnvironmentType = 't' | '';

export interface PayuniConfig {
  merKey: string;
  merIV: string;
  type?: EnvironmentType;
}

export interface BatchQueryResult {
  tradeNo: string;
  result: ResultModel;
}

export interface TradeQueryResponse {
  Status: string;
  TradeNo?: string;
  TradeAmt?: number;
  MerTradeNo?: string;
  PayType?: string;
  [key: string]: any;
}