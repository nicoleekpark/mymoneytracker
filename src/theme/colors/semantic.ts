import type { SemanticColors } from '../types'
import { PALETTE } from './base'

// ===============================
// Monet 1875 Garden Palette (A)
// Parasol green primary, sunlight warning, sky info, coral danger
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

  // Brand (parasol green teal)
  primary: PALETTE.garden.teal,
  primarySoft: PALETTE.garden.tealSoft,
  primaryStrong: PALETTE.garden.tealStrong,

  // Status - WCAG AA compliant
  success: PALETTE.income.light,
  successSoft: PALETTE.income.lightSoft,

  warning: PALETTE.warning.light,
  warningSoft: PALETTE.warning.lightSoft,

  danger: PALETTE.expense.light,
  dangerSoft: PALETTE.expense.lightSoft,

  info: PALETTE.info.light,
  infoSoft: PALETTE.info.lightSoft,

  // Highlight (same as primary for Garden palette)
  highlight: PALETTE.garden.teal,
  highlightSoft: PALETTE.garden.tealSoft,
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

  // Brand (soft mint)
  primary: PALETTE.garden.mint,
  primarySoft: PALETTE.garden.mintSoft,
  primaryStrong: PALETTE.surfaceDark.background,

  // Status - bright on dark
  success: PALETTE.income.dark,
  successSoft: PALETTE.income.darkSoft,

  warning: PALETTE.warning.dark,
  warningSoft: PALETTE.warning.darkSoft,

  danger: PALETTE.expense.dark,
  dangerSoft: PALETTE.expense.darkSoft,

  info: PALETTE.info.dark,
  infoSoft: PALETTE.info.darkSoft,

  // Highlight
  highlight: PALETTE.garden.mint,
  highlightSoft: PALETTE.garden.mintSoft,
}
