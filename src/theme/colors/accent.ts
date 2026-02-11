// ===============================
// Monet Natural - Section Accent Colors
// Theme-aware accent bars for section headers
// ===============================

import { PALETTE } from './base'

// Accent colors for section header bars
// Inspired by Monet's painting: garden greens, sky blues, sunlit ambers

export const accentColorsLight = {
  green: PALETTE.garden.teal,        // #3D6F64 - budget, income sections
  blue: PALETTE.info.light,          // #2E5E8E - daily, tracking sections
  amber: PALETTE.warning.light,      // #8A5A14 - expense sections (sunlight)
  purple: '#5A5A7A',                 // mist purple - special sections
  red: PALETTE.expense.light,        // #8C3D2B - danger/expense accent
} as const

export const accentColorsDark = {
  green: PALETTE.garden.mint,        // #86D6C7 - budget, income sections
  blue: PALETTE.info.dark,           // #9CC2FF - daily, tracking sections
  amber: PALETTE.warning.dark,       // #FFD38A - expense sections (sunlight)
  purple: '#A8A8C8',                 // mist purple - special sections
  red: PALETTE.expense.dark,         // #FF9B7A - danger/expense accent
} as const
