import { financeColors } from './colors/finance'
import { semanticDark, semanticLight } from './colors/semantic'
import type { Theme } from './types'

export const lightTheme: Theme = {
  mode: 'light',
  semantic: semanticLight,
  finance: financeColors
}

export const darkTheme: Theme = {
  mode: 'dark',
  semantic: semanticDark,
  finance: financeColors
}

export const THEMES = {
  light: lightTheme,
  dark: darkTheme
} as const
