export type ThemeMode = 'light' | 'dark' | null

export type SemanticColors = {
  background: string
  backgroundAlt: string
  surface: string
  surfaceAlt: string
  border: string
  text: string
  textSecondary: string
  primary: string
  primarySoft: string
  primaryStrong: string
  success: string
  warning: string
  danger: string
  info: string
}

export type FinanceColors = {
  income: string
  expense: string
  transfer: string
  gain: string
  loss: string
}

export type Theme = {
  mode: Exclude<ThemeMode, null>
  semantic: SemanticColors
  finance: FinanceColors
}
