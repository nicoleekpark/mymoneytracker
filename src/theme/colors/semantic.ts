import type { SemanticColors } from '../types'
import { PALETTE } from './base'

export const semanticLight: SemanticColors = {
  // App background (warm stone tones)
  background: PALETTE.zinc[50],
  backgroundAlt: PALETTE.zinc[100],

  // Cards / surfaces
  surface: '#FFFFFF',
  surfaceAlt: PALETTE.zinc[100],
  border: PALETTE.zinc[200],

  // Text
  text: PALETTE.zinc[900],
  textSecondary: PALETTE.zinc[500],

  // Brand (Warm Gray - Editorial)
  primary: PALETTE.editorial.primary,
  primarySoft: PALETTE.editorial.primarySoft,
  primaryStrong: PALETTE.zinc[600],

  // Status (Forest + Terracotta)
  success: PALETTE.editorial.forest,
  successSoft: PALETTE.editorial.forestSoft,

  warning: PALETTE.editorial.gold,

  danger: PALETTE.editorial.terracotta,
  dangerSoft: PALETTE.editorial.terracottaSoft,

  info: PALETTE.blue[500],
  infoSoft: PALETTE.blue[50]
}


export const semanticDark: SemanticColors = {
  // App background (warm stone tones)
  background: PALETTE.zinc[950],
  backgroundAlt: PALETTE.zinc[900],

  // Cards / surfaces
  surface: PALETTE.zinc[900],
  surfaceAlt: PALETTE.zinc[800],
  border: PALETTE.zinc[700],

  // Text
  text: PALETTE.zinc[50],
  textSecondary: PALETTE.zinc[400],

  // Brand (Warm Gray - Editorial, lighter for dark mode)
  primary: PALETTE.editorial.primaryLight,
  primarySoft: PALETTE.editorial.primarySoftDark,
  primaryStrong: PALETTE.zinc[300],

  // Status (Forest + Terracotta, lighter for dark mode)
  success: PALETTE.editorial.forestLight,
  successSoft: PALETTE.editorial.forestSoftDark,

  warning: PALETTE.editorial.goldLight,

  danger: PALETTE.editorial.terracottaLight,
  dangerSoft: PALETTE.editorial.terracottaSoftDark,

  info: PALETTE.blue[400],
  infoSoft: PALETTE.blue[900]
}

