import type { Currency, CurrencyCode } from './currencies.types'

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    minorUnits: 2,
    symbol: '$'
  },
  KRW: {
    code: 'KRW',
    name: 'South Korean Won',
    minorUnits: 0,
    symbol: '₩'
  },
  VND: {
    code: 'VND',
    name: 'Vietnamese Dong',
    minorUnits: 0,
    symbol: '₫'
  }
}
