import type { SemanticColors } from '../types'
import { PALETTE } from './base'

// ===============================
// Monet 1875 "Woman with a Parasol" - Option C2
// Sky blue primary, parasol green income, warm peach expense
// Soft, misty, impressionistic
// ===============================

export const semanticLight: SemanticColors = {
  // App background (airy sky paper)
  background: PALETTE.surfaceLight.background,
  backgroundAlt: PALETTE.surfaceLight.backgroundAlt,

  // Cards / surfaces
  surface: PALETTE.surfaceLight.surface,
  surfaceAlt: PALETTE.surfaceLight.surfaceAlt,
  border: PALETTE.surfaceLight.border,

  // Text
  text: PALETTE.text.light,
  textSecondary: PALETTE.text.lightSecondary,

  // Brand (sky blue - UI actions)
  primary: PALETTE.sky.blue,
  primarySoft: PALETTE.sky.blueSoft,
  primaryStrong: PALETTE.sky.blueStrong,
  onPrimary: '#FFFFFF',  // white text on blue

  // Status - WCAG AA compliant
  success: PALETTE.income.light,     // parasol green
  successSoft: PALETTE.income.lightSoft,

  warning: PALETTE.warning.light,
  warningSoft: PALETTE.warning.lightSoft,

  danger: PALETTE.expense.light,     // warm terracotta
  dangerSoft: PALETTE.expense.lightSoft,

  info: PALETTE.info.light,
  infoSoft: PALETTE.info.lightSoft,

  // Highlight (use income/green for positive highlights)
  highlight: PALETTE.income.light,
  highlightSoft: PALETTE.income.lightSoft,
}

export const semanticDark: SemanticColors = {
  // App background (deep ocean night)
  background: PALETTE.surfaceDark.background,
  backgroundAlt: PALETTE.surfaceDark.backgroundAlt,

  // Cards / surfaces
  surface: PALETTE.surfaceDark.surface,
  surfaceAlt: PALETTE.surfaceDark.surfaceAlt,
  border: PALETTE.surfaceDark.border,

  // Text
  text: PALETTE.text.dark,
  textSecondary: PALETTE.text.darkSecondary,

  // Brand (misty sky blue - UI actions)
  primary: PALETTE.sky.mist,
  primarySoft: PALETTE.sky.mistSoft,
  primaryStrong: PALETTE.surfaceDark.background,
  onPrimary: '#070D12',  // dark text on light blue

  // Status - bright on dark
  success: PALETTE.income.dark,      // soft mint
  successSoft: PALETTE.income.darkSoft,

  warning: PALETTE.warning.dark,
  warningSoft: PALETTE.warning.darkSoft,

  danger: PALETTE.expense.dark,      // soft peach
  dangerSoft: PALETTE.expense.darkSoft,

  info: PALETTE.info.dark,
  infoSoft: PALETTE.info.darkSoft,

  // Highlight (use income/green for positive highlights)
  highlight: PALETTE.income.dark,
  highlightSoft: PALETTE.income.darkSoft,
}
