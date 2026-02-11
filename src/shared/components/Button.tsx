/**
 * Button Component - Design System
 *
 * A flexible, reusable button component following Apple HIG principles.
 * Supports multiple variants for different use cases throughout the app.
 *
 * ## Variants
 * - `primary`: Filled button with primary color background (main actions)
 * - `secondary`: Outlined button with border (alternative actions)
 * - `text`: Text-only button, no background (tertiary/cancel actions)
 * - `danger`: Filled button with danger color (destructive actions)
 *
 * ## Sizes
 * - `large`: 50px height, 17px font (default for full-width CTAs)
 * - `medium`: 44px height, 16px font (standard buttons)
 * - `small`: 36px height, 14px font (compact/inline buttons)
 *
 * ## Usage Examples
 * ```tsx
 * // Primary CTA (full width)
 * <Button onPress={handleSave}>Add</Button>
 *
 * // Text link style
 * <Button variant="text" onPress={toggleDraft}>Save as draft instead</Button>
 *
 * // Danger action
 * <Button variant="danger" onPress={handleDelete}>Delete</Button>
 *
 * // Disabled state
 * <Button disabled={!canSave} onPress={handleSave}>Save</Button>
 *
 * // Inline button (not full width)
 * <Button size="small" fullWidth={false} onPress={handleAction}>Edit</Button>
 * ```
 */

import { useHoHTheme } from '@/providers'
import { radius } from '@/theme/tokens/radius'
import { fontSize } from '@/theme/tokens/typography'
import React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native'

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger'
export type ButtonSize = 'large' | 'medium' | 'small'

export type ButtonProps = {
  /** Button label text */
  children: string
  /** Visual style variant */
  variant?: ButtonVariant
  /** Button size preset */
  size?: ButtonSize
  /** Whether button spans full width of container */
  fullWidth?: boolean
  /** Disabled state - reduces opacity and prevents press */
  disabled?: boolean
  /** Press handler */
  onPress?: PressableProps['onPress']
  /** Additional container styles */
  style?: StyleProp<ViewStyle>
  /** Additional text styles */
  textStyle?: StyleProp<TextStyle>
}

/**
 * Size configurations following Apple HIG spacing
 */
const SIZE_CONFIG = {
  large: {
    height: 50,
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    borderRadius: radius.lg,
    paddingHorizontal: 24,
  },
  medium: {
    height: 44,
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    borderRadius: radius.lg,
    paddingHorizontal: 20,
  },
  small: {
    height: 36,
    fontSize: fontSize.md,
    fontWeight: '500' as const,
    borderRadius: radius.md,
    paddingHorizontal: 16,
  },
} as const

/**
 * Opacity values for interactive states
 */
const OPACITY = {
  pressed: 0.8,
  disabled: 0.4,
} as const

export function Button({
  children,
  variant = 'primary',
  size = 'large',
  fullWidth = true,
  disabled = false,
  onPress,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useHoHTheme()
  const sizeConfig = SIZE_CONFIG[size]

  /**
   * Get background color based on variant
   */
  const getBackgroundColor = (): string | undefined => {
    switch (variant) {
      case 'primary':
        return theme.semantic.primary
      case 'danger':
        return theme.semantic.danger
      case 'secondary':
      case 'text':
        return 'transparent'
    }
  }

  /**
   * Get text color based on variant
   */
  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF'
      case 'secondary':
        return theme.semantic.primary
      case 'text':
        return theme.semantic.textSecondary
    }
  }

  /**
   * Get border style for secondary variant
   */
  const getBorderStyle = (): ViewStyle | undefined => {
    if (variant === 'secondary') {
      return {
        borderWidth: 1,
        borderColor: theme.semantic.border,
      }
    }
    return undefined
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: variant === 'text' ? 'auto' : sizeConfig.height,
          borderRadius: sizeConfig.borderRadius,
          paddingHorizontal: variant === 'text' ? 0 : sizeConfig.paddingHorizontal,
          paddingVertical: variant === 'text' ? 8 : 0,
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? OPACITY.disabled : pressed ? OPACITY.pressed : 1,
          width: fullWidth ? '100%' : undefined,
        },
        getBorderStyle(),
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeConfig.fontSize,
            fontWeight: sizeConfig.fontWeight,
            color: getTextColor(),
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
})
