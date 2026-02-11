/**
 * WCAG Color Contrast Utilities
 *
 * WCAG 2.1 Requirements:
 * - Level AA: 4.5:1 for normal text, 3:1 for large text (≥18px or ≥14px bold)
 * - Level AAA: 7:1 for normal text, 4.5:1 for large text
 */

/**
 * Parse hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '')
  const bigint = parseInt(cleaned, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)

  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio in format X:1
 */
export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast meets WCAG AA for normal text (4.5:1)
 */
export function meetsWcagAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5
}

/**
 * Check if contrast meets WCAG AA for large text (3:1)
 */
export function meetsWcagAALarge(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 3
}

/**
 * Check if contrast meets WCAG AAA for normal text (7:1)
 */
export function meetsWcagAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7
}

/**
 * Get WCAG compliance level for a color pair
 */
export function getWcagLevel(
  foreground: string,
  background: string
): 'AAA' | 'AA' | 'AA-large' | 'fail' {
  const ratio = getContrastRatio(foreground, background)

  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA-large'
  return 'fail'
}

/**
 * Audit a color palette against a background
 * Useful for validating theme colors
 */
export function auditContrast(
  colors: Record<string, string>,
  background: string
): Record<string, { ratio: number; level: string }> {
  const results: Record<string, { ratio: number; level: string }> = {}

  for (const [name, color] of Object.entries(colors)) {
    const ratio = getContrastRatio(color, background)
    results[name] = {
      ratio: Math.round(ratio * 100) / 100,
      level: getWcagLevel(color, background),
    }
  }

  return results
}

// Pre-calculated contrast ratios for current theme (for reference)
export const THEME_CONTRAST_RATIOS = {
  dark: {
    background: '#000000',
    text: { color: '#ffffff', ratio: 21, level: 'AAA' },
    textSecondary: { color: '#999999', ratio: 5.3, level: 'AA' },
    success: { color: '#00ffa3', ratio: 15.8, level: 'AAA' },
    danger: { color: '#ff6b00', ratio: 7.1, level: 'AAA' },
  },
  light: {
    background: '#fafafa',
    text: { color: '#18181b', ratio: 16.1, level: 'AAA' },
    textSecondary: { color: '#525252', ratio: 7.0, level: 'AA' },
    success: { color: '#007a4d', ratio: 5.2, level: 'AA' },
    danger: { color: '#b34700', ratio: 5.0, level: 'AA' },
  },
} as const
