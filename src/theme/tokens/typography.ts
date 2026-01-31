// Font sizes
export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const

// Font weights (RN uses string)
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
}

// Letter spacing
export const letterSpacing = {
  tight: -0.2,
  normal: 0,
  wide: 0.2,
} as const

// Pre-composed text styles (3 header variants)
export const textStyles = {
  screenHeader: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: letterSpacing.normal,
  },
  sectionHeader: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.wide,
  },
  cardHeader: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.normal,
  },
} as const

// Legacy export (backwards compatibility)
export const typography = {
  title: fontSize.xl,
  subtitle: fontSize.lg,
  body: fontSize.md,
  small: fontSize.sm,
} as const
