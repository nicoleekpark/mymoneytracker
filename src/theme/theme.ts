import { PALETTE } from './colors';

export type ThemeMode = 'light' | 'dark' | null

export type SemanticColors = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;
  border: string;

  text: string;
  textMuted: string;

  primary: string;
  primarySoft: string;
  primaryStrong: string;

  success: string;
  warning: string;
  danger: string;
  info: string;
};

export type FinanceColors = {
  income: string;
  expense: string;
  transfer: string;

  gain: string;
  loss: string;
}

export type Theme = {
  mode: Exclude<ThemeMode, null>
  semantic: SemanticColors
  finance: FinanceColors
}

// ===============================================================
// APP THEME - ORANGE
// ===============================================================
export const lightTheme: Theme = {
  mode: 'light',
  semantic: {
    background: '#ffffff',
    backgroundAlt: PALETTE.gray[50],
    surface: '#ffffff',
    surfaceAlt: PALETTE.gray[100],
    border: PALETTE.gray[200],

    // Text
    text: PALETTE.gray[900],
    textMuted: PALETTE.gray[500],

    // Primary (Orange)
    primary: PALETTE.orange[500],
    primarySoft: PALETTE.orange[100],
    primaryStrong: PALETTE.orange[600],

    // Status
    success: PALETTE.green[600],
    warning: PALETTE.amber[500],
    danger: PALETTE.red[500],
    info: PALETTE.blue[500]
  },
  finance: {
    income: PALETTE.green[500],
    expense: PALETTE.red[500],
    transfer: PALETTE.teal[500],
    gain: PALETTE.emerald[500],
    loss: PALETTE.rose[500]
  }
} as const;

// TODO update darkTheme palette
export const darkTheme: Theme = {
  mode: 'dark',
  semantic: {
    background: '#ffffff',
    backgroundAlt: PALETTE.gray[50],
    surface: '#ffffff',
    surfaceAlt: PALETTE.gray[100],
    border: PALETTE.gray[200],

    // Text
    text: PALETTE.gray[900],
    textMuted: PALETTE.gray[500],

    // Primary (Orange)
    primary: PALETTE.orange[500],
    primarySoft: PALETTE.orange[100],
    primaryStrong: PALETTE.orange[600],

    // Status
    success: PALETTE.green[600],
    warning: PALETTE.amber[500],
    danger: PALETTE.red[500],
    info: PALETTE.blue[500]
  },
  finance: {
    income: PALETTE.green[500],
    expense: PALETTE.red[500],
    transfer: PALETTE.teal[500],
    gain: PALETTE.emerald[500],
    loss: PALETTE.rose[500]
  }
} as const;

export const THEMES = {
  light: lightTheme,
  dark: darkTheme
} as const;