/**
 * Animation Tokens
 *
 * Shared animation configurations for consistent feel across the app.
 */

/**
 * Spring animation config for pressable scale effects.
 * Used by ScalePressable and similar animated components.
 */
export const SPRING_CONFIG = {
  /** Standard press animation - snappy but not jarring */
  press: {
    damping: 15,
    stiffness: 400,
  },
  /** Gentle animation for subtle transitions */
  gentle: {
    damping: 20,
    stiffness: 300,
  },
  /** Bouncy animation for playful interactions */
  bouncy: {
    damping: 10,
    stiffness: 500,
  },
} as const

/**
 * Scale values for pressable animations.
 */
export const SCALE_VALUES = {
  /** Default press scale */
  press: 0.96,
  /** Slightly more dramatic press */
  pressDeep: 0.95,
  /** Subtle press for small elements */
  pressSubtle: 0.98,
} as const
