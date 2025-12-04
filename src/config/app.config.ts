import type { AppConfig } from '@/types';

export const APP_CONFIG: AppConfig = {
  name: 'HoH Finance Tracker',
  version: '1.0.0',
  currency: {
    code: 'USD',
    name: 'US Dollar',
    minorUnits: 2,
    symbol: '$'
  },
  featureFlags: {
    familySharing: false,
    bankConnection: false,
    bankSync: false,
    receiptCapture: false,
    notifications: false,
    widget: false
  }
} as const; // readonly
