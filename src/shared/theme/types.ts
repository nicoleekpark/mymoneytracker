export type ThemeMode = 'light' | 'dark' | null

export type SemanticColors = {
  background: string
  backgroundAlt: string
  surface: string
  surfaceAlt: string
  border: string

  text: string
  textSecondary: string

  primary: string
  primarySoft: string
  primaryStrong: string
  onPrimary: string  // text color on primary background

  success: string
  successSoft: string

  warning: string
  warningSoft: string

  danger: string
  dangerSoft: string

  info: string
  infoSoft: string

  highlight: string // Lavender - for achievements, milestones, special days
  highlightSoft: string
}

export type FinanceColors = {
  income: string
  expense: string
  transfer: string
  gain: string
  loss: string
}

export type AccentColors = {
  green: string   // budget, income sections
  blue: string    // daily, tracking sections
  amber: string   // expense sections (sunlight)
  purple: string  // special sections
  peach: string   // expense accent (Monet warm peach)
}

export type Theme = {
  mode: Exclude<ThemeMode, null>
  semantic: SemanticColors
  finance: FinanceColors
  accent: AccentColors
}
