// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================
// STRICT RULE: Only use these tokens. No hardcoded font sizes allowed.
// =============================================================================

// -----------------------------------------------------------------------------
// Text Scale - For readable content (body text, labels, headers)
// -----------------------------------------------------------------------------
export const fontSize = {
  xs: 12,      // captions, labels, timestamps
  sm: 13,      // secondary text, hints
  md: 14,      // body text (default)
  lg: 16,      // subtitles, row titles, buttons
  xl: 18,      // stat amounts, emphasized text
  '2xl': 20,   // section headers
  '3xl': 24,   // large headers
} as const

// -----------------------------------------------------------------------------
// Display Scale - For hero/promotional numbers (amounts, percentages)
// -----------------------------------------------------------------------------
export const displaySize = {
  sm: 28,      // tertiary emphasis (no data messages)
  md: 32,      // secondary emphasis (breaking even, medium amounts)
  lg: 40,      // primary emphasis (projections)
  xl: 48,      // hero numbers (main savings/net amount)
} as const

// -----------------------------------------------------------------------------
// Font Weights
// -----------------------------------------------------------------------------
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
}

// -----------------------------------------------------------------------------
// Letter Spacing
// -----------------------------------------------------------------------------
export const letterSpacing = {
  tight: -0.2,
  normal: 0,
  wide: 0.2,
  wider: 0.5,
} as const

// -----------------------------------------------------------------------------
// Pre-composed Text Styles
// -----------------------------------------------------------------------------
export const textStyles = {
  // Screen-level header (tab titles, modal titles)
  screenHeader: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.black,
    letterSpacing: letterSpacing.normal,
  },
  // Primary section header: Card/section titles
  sectionHeader: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.wide,
  },
  // Accent header: Sub-labels within cards (UPPERCASE)
  accentHeader: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wider,
  },
  // Card header
  cardHeader: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.normal,
  },
  // Body text
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  // Caption/label
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
} as const

// -----------------------------------------------------------------------------
// Legacy Exports (for backward compatibility - prefer semantic names above)
// -----------------------------------------------------------------------------
export const typography = {
  title: fontSize['2xl'],
  subtitle: fontSize.lg,
  body: fontSize.md,
  small: fontSize.sm,
} as const
