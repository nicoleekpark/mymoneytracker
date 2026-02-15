// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================
// STRICT RULE: Only use these tokens. No hardcoded font sizes allowed.
// Compliance: Apple HIG + WCAG accessibility guidelines
// Reference: BASERULES.md for full typography rules
// =============================================================================

// -----------------------------------------------------------------------------
// Text Scale - For readable content (body text, labels, headers)
// -----------------------------------------------------------------------------
// ACCESSIBILITY MINIMUMS (per Apple HIG + WCAG):
// - Absolute minimum: 12px (xs) - only for timestamps, tertiary labels
// - Secondary content: 14px (sm) minimum
// - Body text: 16px (md) minimum - primary content baseline
// - Interactive elements: 14px+ (preferably 16px+)
// - Touch targets: 44x44pt minimum
// -----------------------------------------------------------------------------
export const fontSize = {
  xs: 12,      // MINIMUM - timestamps, tertiary labels, chart axes only
  sm: 14,      // secondary text, hints, table cells, tab labels
  md: 16,      // body text (DEFAULT) - primary readable content
  lg: 18,      // subtitles, row titles, buttons, navigation
  xl: 20,      // stat amounts, emphasized text
  '2xl': 22,   // section headers
  '3xl': 24,   // large headers, card primary values
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
    fontSize: fontSize['2xl'],      // 22px
    fontWeight: fontWeight.black,
    letterSpacing: letterSpacing.normal,
  },
  // Primary section header: Card/section titles
  sectionHeader: {
    fontSize: fontSize.lg,          // 18px
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.wide,
  },
  // Accent header: Sub-labels within cards (UPPERCASE)
  accentHeader: {
    fontSize: fontSize.sm,          // 14px
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wider,
  },
  // Card header
  cardHeader: {
    fontSize: fontSize.md,          // 16px
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.normal,
  },
  // Body text - primary readable content
  body: {
    fontSize: fontSize.md,          // 16px - WCAG/Apple HIG compliant
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  // Caption/label - use sparingly for non-critical info
  caption: {
    fontSize: fontSize.xs,          // 12px - minimum allowed
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
} as const

// -----------------------------------------------------------------------------
// Legacy Exports (for backward compatibility - prefer semantic names above)
// -----------------------------------------------------------------------------
export const typography = {
  title: fontSize['2xl'],   // 22px
  subtitle: fontSize.lg,    // 18px
  body: fontSize.md,        // 16px
  small: fontSize.sm,       // 14px
} as const
