// ===============================
// Monet 1875 "Woman with a Parasol" Garden Palette
// Airy sky paper, mist tints, muted parasol green
// ===============================

// Garden greens - primary action colors
export const garden = {
  // Light mode
  teal: '#3D6F64',        // Primary - parasol green teal
  tealSoft: '#DCEEE9',    // Primary soft background
  tealStrong: '#274D45',  // Primary strong/pressed

  // Dark mode
  mint: '#86D6C7',        // Primary - soft mint
  mintSoft: '#0F2A2F',    // Primary soft background
} as const

// Status colors - income/success
export const income = {
  light: '#1F6B56',       // Deeper green for light mode
  lightSoft: '#D8F0E8',
  dark: '#67D2B6',        // Brighter mint for dark mode
  darkSoft: '#12352E',
} as const

// Status colors - expense/danger
export const expense = {
  light: '#8C3D2B',       // Muted coral for light mode
  lightSoft: '#F6D9D2',
  dark: '#FF9B7A',        // Soft peach for dark mode
  darkSoft: '#3A1F14',
} as const

// Warning - sunlight amber
export const warning = {
  light: '#8A5A14',
  lightSoft: '#F3E6C4',
  dark: '#FFD38A',
  darkSoft: '#3A2B10',
} as const

// Info - sky blue
export const info = {
  light: '#2E5E8E',
  lightSoft: '#DCE9F8',
  dark: '#9CC2FF',
  darkSoft: '#14233A',
} as const

// Neutral surfaces - light mode (airy sky paper)
export const surfaceLight = {
  background: '#F4F8FB',
  backgroundAlt: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#ECF3F7',
  border: '#D2E1EA',
} as const

// Neutral surfaces - dark mode (deep ocean night)
export const surfaceDark = {
  background: '#071015',
  backgroundAlt: '#0B1A23',
  surface: '#0B1A23',
  surfaceAlt: '#102432',
  border: '#1E3340',
} as const

// Text colors
export const text = {
  light: '#13202B',
  lightSecondary: '#3E5B6D',
  dark: '#F3F7FB',
  darkSecondary: '#A6B8C6',
} as const

// Transfer/neutral
export const neutral = {
  light: '#6B7C88',
  dark: '#94A1AA',
} as const

export const PALETTE = {
  garden,
  income,
  expense,
  warning,
  info,
  surfaceLight,
  surfaceDark,
  text,
  neutral,
} as const

export type ColorGroup = keyof typeof PALETTE
