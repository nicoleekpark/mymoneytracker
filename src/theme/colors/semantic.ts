import type { SemanticColors } from '../types'
import { PALETTE } from './base'

export const semanticLight: SemanticColors = {
  background: '#ffffff',
  backgroundAlt: PALETTE.gray[50],
  surface: '#ffffff',
  surfaceAlt: PALETTE.gray[100],
  border: PALETTE.gray[200],

  text: PALETTE.gray[900],
  textSecondary: PALETTE.gray[500],

  primary: PALETTE.orange[500],
  primarySoft: PALETTE.orange[100],
  primaryStrong: PALETTE.orange[600],

  success: PALETTE.green[600],
  warning: PALETTE.amber[500],
  danger: PALETTE.red[500],
  info: PALETTE.blue[500]
}


export const semanticDark: SemanticColors = {
  background: PALETTE.gray[950],
  backgroundAlt: PALETTE.gray[900],
  surface: PALETTE.gray[900],
  surfaceAlt: PALETTE.gray[800],
  border: PALETTE.gray[700],

  text: PALETTE.gray[50],
  textSecondary: PALETTE.gray[400],

  primary: PALETTE.orange[500],
  primarySoft: PALETTE.orange[800],
  primaryStrong: PALETTE.orange[300],

  success: PALETTE.green[400],
  warning: PALETTE.amber[400],
  danger: PALETTE.red[400],
  info: PALETTE.blue[400]
}
