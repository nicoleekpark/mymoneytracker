/**
 * CTAContainer
 *
 * Reusable bottom-anchored container for CTA buttons in modals.
 * Handles safe area insets automatically.
 *
 * Uses design system styles from modalStyles.
 *
 * @param insideBottomSheet - Set to true when used inside @gorhom/bottom-sheet.
 *   BottomSheetModal already positions content within safe area, so we don't
 *   need additional bottom offset.
 */

import React from 'react'
import { View, type ViewStyle, type StyleProp } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHoHTheme } from '@/shared/providers'
import { modalStyles } from '@/shared/theme/tokens/modal'

type CTAContainerProps = {
  children: React.ReactNode
  /** Additional styles to merge */
  style?: StyleProp<ViewStyle>
  /**
   * Set to true when used inside @gorhom/bottom-sheet.
   * BottomSheetModal already handles safe area, so bottom offset is 0.
   */
  insideBottomSheet?: boolean
}

export function CTAContainer({ children, style, insideBottomSheet = false }: CTAContainerProps) {
  const insets = useSafeAreaInsets()
  const theme = useHoHTheme()

  return (
    <View
      style={[
        modalStyles.ctaContainerAbsolute,
        {
          backgroundColor: theme.semantic.surface,
          bottom: insideBottomSheet ? 0 : insets.bottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
