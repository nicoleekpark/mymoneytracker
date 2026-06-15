/**
 * BottomSheetContainer
 *
 * Reusable container for bottom sheet content.
 * Handles safe area insets and consistent styling automatically.
 *
 * Uses design system styles from modalStyles.
 */

import React from 'react'
import { View, type ViewStyle, type StyleProp } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHoHTheme } from '@/shared/providers'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'

type BottomSheetContainerProps = {
  children: React.ReactNode
  /** Show top border (default: true) */
  showBorder?: boolean
  /** Additional styles to merge */
  style?: StyleProp<ViewStyle>
}

export function BottomSheetContainer({
  children,
  showBorder = true,
  style
}: BottomSheetContainerProps) {
  const insets = useSafeAreaInsets()
  const theme = useHoHTheme()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.semantic.surface,
          borderColor: showBorder ? theme.semantic.border : 'transparent',
          paddingBottom: insets.bottom + spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = {
  container: {
    borderTopWidth: 1,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
} as const
