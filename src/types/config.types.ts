export type CurrencyCodeType = 'USD' | 'KRW' | 'VND'
export type CurrencySymbolType =  '$' | '₩' | '₫'

export type Currency = {
  code: CurrencyCodeType;
  name: string;
  minorUnits: number;
  symbol: CurrencySymbolType;
}

export type FeatureFlags = {
  familySharing: boolean;
  bankConnection: boolean;
  bankSync: boolean;
  receiptCapture: boolean;
  notifications: boolean;
  widget: boolean;
}

export type AppConfig = {
  name: string;
  version: string;
  currency: Currency;
  featureFlags: FeatureFlags
}