export type CurrencyCode = 'USD' | 'KRW' | 'VND'
export type CurrencySymbol = '$' | '₩' | '₫'

export type Currency = Readonly<{
  code: CurrencyCode
  name: string
  minorUnits: number
  symbol: CurrencySymbol
}>
