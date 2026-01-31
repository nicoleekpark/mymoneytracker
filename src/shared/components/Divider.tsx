import { useHoHTheme } from '@/providers'
import React from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

type DividerSpacing = 'none' | 'sm' | 'md' | 'lg'

type DividerProps = {
  spacing?: DividerSpacing
  opacity?: number
  style?: StyleProp<ViewStyle>
}

const spacingMap: Record<DividerSpacing, number> = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
}

export function Divider({ spacing = 'none', opacity = 1, style }: DividerProps) {
  const theme = useHoHTheme()
  const marginVertical = spacingMap[spacing]

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: theme.semantic.border,
          marginVertical,
          opacity,
        },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
  },
})
