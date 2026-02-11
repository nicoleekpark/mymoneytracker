// =============================================================================
// BORDER RADIUS TOKENS
// =============================================================================
// STRICT RULE: Only use these tokens. No hardcoded border radius allowed.
// For circles, use `full` (9999) or calculate based on element size.
// =============================================================================

export const radius = {
  none: 0,
  xs: 2,       // accent lines, progress bars, small indicators
  sm: 4,       // small elements, dots, tags
  md: 8,       // buttons, small cards, inputs
  lg: 12,      // cards, modals, larger inputs
  xl: 16,      // large cards, sheets
  '2xl': 24,   // extra large elements
  full: 9999,  // circles, pills
} as const
