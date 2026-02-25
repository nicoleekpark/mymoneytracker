// ===============================
// Monet Natural - Section Accent Colors
// Theme-aware accent bars for section headers
// Option C2: Sky blue primary, parasol green income
// ===============================

import { PALETTE } from './base'

// Accent colors for section header bars
// Inspired by Monet's painting: sky blues, parasol greens, sunlit ambers

export const accentColorsLight = {
  blue: PALETTE.sky.blue,            // #4A7A9A - primary actions, navigation
  green: PALETTE.income.light,       // #4A7A6A - income, budget sections
  amber: PALETTE.warning.light,      // #8A6A2A - warning sections (sunlight)
  purple: '#5A5A7A',                 // mist purple - special sections
  peach: PALETTE.expense.light,      // #9B5A4A - expense accent
} as const

export const accentColorsDark = {
  blue: PALETTE.sky.mist,            // #9AC4DE - primary actions, navigation
  green: PALETTE.income.dark,        // #7BCDB8 - income, budget sections
  amber: PALETTE.warning.dark,       // #E8C890 - warning sections (sunlight)
  purple: '#A8A8C8',                 // mist purple - special sections
  peach: PALETTE.expense.dark,       // #E8A090 - expense accent
} as const
