// ===============================
// Monet 1875 "Woman with a Parasol" Garden Palette
// Option C2: Sky blue primary, parasol green for income
// Soft, misty, impressionistic colors
// ===============================

// Sky blues - primary action colors (UI elements, buttons, links)
export const sky = {
  // Light mode
  blue: '#4A7A9A',        // Primary - soft sky blue
  blueSoft: '#E0EBF2',    // Primary soft background
  blueStrong: '#3A6A8A',  // Primary strong/pressed

  // Dark mode
  mist: '#9AC4DE',        // Primary - misty sky
  mistSoft: '#0F1F2A',    // Primary soft background
} as const

// Parasol greens - income/success (money coming in)
export const income = {
  light: '#4A7A6A',       // Parasol teal-green for light mode
  lightSoft: '#DCF0E8',
  dark: '#7BCDB8',        // Soft mint for dark mode
  darkSoft: '#102A24',
} as const

// Warm peach - expense/danger (money going out)
export const expense = {
  light: '#9B5A4A',       // Warm terracotta for light mode
  lightSoft: '#F4E0D8',
  dark: '#E8A090',        // Soft peach for dark mode
  darkSoft: '#2A1A14',
} as const

// Sunlight amber - warning
export const warning = {
  light: '#8A6A2A',
  lightSoft: '#F4ECD8',
  dark: '#E8C890',
  darkSoft: '#2A2410',
} as const

// Info - complementary blue (slightly different from primary)
export const info = {
  light: '#3A6A8A',
  lightSoft: '#DCE8F2',
  dark: '#8AB8D8',
  darkSoft: '#14202A',
} as const

// Neutral surfaces - light mode (airy sky paper)
export const surfaceLight = {
  background: '#F6F9FB',
  backgroundAlt: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF4F8',
  border: '#D8E4EC',
} as const

// Neutral surfaces - dark mode (deep ocean night)
export const surfaceDark = {
  background: '#070D12',
  backgroundAlt: '#0A161E',
  surface: '#0A161E',
  surfaceAlt: '#0F1F2A',
  border: '#1A3040',
} as const

// Text colors
export const text = {
  light: '#1A2B38',
  lightSecondary: '#5A7A8A',
  dark: '#F5F8FA',
  darkSecondary: '#9EB5C5',
} as const

// Transfer/neutral
export const neutral = {
  light: '#6A7A88',
  dark: '#8A9AA8',
} as const

export const PALETTE = {
  sky,
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
