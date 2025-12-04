import { PALETTE } from './colors'

export type ThemeMode = 'light' | 'dark'

export type SemanticColors = {
  background: string
  backgroundAlt: string
  surface: string
  surfaceAlt: string
  border: string

  text: string
  textMuted: string

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

  chartUp: string
  chartDown: string
}

export type Theme = {
  mode: ThemeMode
  semantic: SemanticColors
  finance: FinanceColors
}

// light theme
export const lightTheme: Theme = {
  mode: 'light',
  semantic: {
    background: PALETTE.gray[50],
    backgroundAlt: PALETTE.gray[100],
    surface: '#ffffff',
    surfaceAlt: PALETTE.gray[100],
    border: PALETTE.gray[300],

    text: PALETTE.gray[900],
    textMuted: PALETTE.gray[600],

    primary: PALETTE.orange[500],
    primarySoft: PALETTE.orange[100],
    primaryStrong: PALETTE.orange[600],

    success: PALETTE.green[600],
    warning: PALETTE.amber[500],
    danger: PALETTE.red[600],
    info: PALETTE.blue[500]
  },
  finance: {
    income: PALETTE.green[500],
    expense: PALETTE.red[500],
    transfer: PALETTE.teal[500],

    gain: PALETTE.emerald[500],
    loss: PALETTE.rose[500],

    chartUp: PALETTE.emerald[400],
    chartDown: PALETTE.red[400]
  }
}

// dark theme
export const darkTheme: Theme = {
  mode: 'dark',
  semantic: {
    background: PALETTE.gray[900],
    backgroundAlt: PALETTE.gray[800],
    surface: PALETTE.gray[800],
    surfaceAlt: PALETTE.gray[700],
    border: PALETTE.gray[700],

    text: PALETTE.gray[50],
    textMuted: PALETTE.gray[400],

    primary: PALETTE.orange[400],
    primarySoft: PALETTE.orange[700],
    primaryStrong: PALETTE.orange[300],

    success: PALETTE.green[400],
    warning: PALETTE.amber[400],
    danger: PALETTE.red[400],
    info: PALETTE.blue[400]
  },
  finance: {
    income: PALETTE.green[400],
    expense: PALETTE.red[400],
    transfer: PALETTE.teal[300],

    gain: PALETTE.emerald[300],
    loss: PALETTE.rose[300],

    chartUp: PALETTE.emerald[200],
    chartDown: PALETTE.red[300]
  }
}

export const THEMES = {
  light: lightTheme,
  dark: darkTheme
} as const
