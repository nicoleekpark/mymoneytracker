import type { SemanticColors } from '../types'
import { PALETTE } from './base'

export const semanticLight: SemanticColors = {
  // App background
  background: '#F9F9FB',
  backgroundAlt: PALETTE.gray[50],

  // Cards / surfaces
  surface: '#FFFFFF',
  surfaceAlt: PALETTE.gray[100],
  border: PALETTE.gray[200],

  // Text
  text: PALETTE.gray[900],
  textSecondary: PALETTE.gray[600],

  // Brand (Orange)
  primary: PALETTE.orange[500],        // action & select (add, confirm) etc
  primarySoft: PALETTE.orange[50],     // 🔽 더 연하게 (badge, chart fill)
  primaryStrong: PALETTE.orange[600],  // pressed (add, confirm) etc

  // Status
  success: PALETTE.green[600],
  successSoft: PALETTE.green[50],

  warning: PALETTE.amber[500],

  danger: PALETTE.red[500],
  dangerSoft: PALETTE.red[50],

  info: PALETTE.blue[500],
  infoSoft: PALETTE.blue[50]
}


export const semanticDark: SemanticColors = {
  // App background
  background: PALETTE.gray[950],
  backgroundAlt: PALETTE.gray[900],

  // Cards / surfaces
  surface: PALETTE.gray[900],
  surfaceAlt: PALETTE.gray[800],
  border: PALETTE.gray[700],

  // Text
  text: PALETTE.gray[50],
  textSecondary: PALETTE.gray[400],

  // Brand (Orange)
  primary: PALETTE.orange[400],        // 🔽 약간 낮춰서 눈부심 감소
  primarySoft: PALETTE.orange[900],    // 아주 어두운 tint
  primaryStrong: PALETTE.orange[300],  // 강조용

  // Status
  success: PALETTE.green[400],
  successSoft: PALETTE.green[900],

  warning: PALETTE.amber[400],

  danger: PALETTE.red[400],
  dangerSoft: PALETTE.red[900],

  info: PALETTE.blue[400],
  infoSoft: PALETTE.blue[900]
}

