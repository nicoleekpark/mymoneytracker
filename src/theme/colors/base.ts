// ===============================
// Minimal Color Palette
// Only includes colors actually used in the app
// ===============================

// Zinc - pure neutral, no undertone (crispest)
export const zinc = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b'
} as const

export const blue = {
  50: '#eff6ff',
  400: '#60a5fa',
  500: '#3b82f6',
  900: '#1e3a8a'
} as const

// ===============================
// Editorial Palette (V1)
// Warm Gray + Forest + Terracotta
// ===============================

export const editorial = {
  // Primary - Warm Gray (slightly more vibrant)
  primary: '#857670',
  primaryLight: '#a8a29e',
  primarySoft: '#f5f5f4',
  primarySoftDark: '#44403c',

  // Success/Income - Forest Green
  forest: '#4a7c59',
  forestLight: '#6ba67a',
  forestSoft: '#f0f5f1',
  forestSoftDark: '#1a2e1f',

  // Danger/Expense - Terracotta
  terracotta: '#c45c4a',
  terracottaLight: '#e08575',
  terracottaSoft: '#fef5f3',
  terracottaSoftDark: '#2e1a16',

  // Warning - Muted Gold
  gold: '#c9a227',
  goldLight: '#dbb84a',
  goldSoft: '#fdfaf0',
  goldSoftDark: '#2e2810'
} as const

export const PALETTE = {
  zinc,
  blue,
  editorial
} as const

export type ColorGroup = keyof typeof PALETTE
