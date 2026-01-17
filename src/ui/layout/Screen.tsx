import React, { useMemo } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { StyleSheet, View } from 'react-native'
import type { Edge } from 'react-native-safe-area-context'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useHoHTheme } from '@/providers'

type ScreenProps = Readonly<{
  children: React.ReactNode

  // default: only top safe-area
  edges?: ReadonlyArray<Edge>

  // default horizontal padding (16)
  padded?: boolean

  // optional top padding (8)
  topPadding?: boolean

  // style for inner content wrapper
  contentStyle?: StyleProp<ViewStyle>

  // style for SafeAreaView container
  style?: StyleProp<ViewStyle>
}>

export function Screen({
  children,
  edges = ['top'],
  padded = true,
  topPadding = false,
  contentStyle,
  style
}: ScreenProps) {
  const theme = useHoHTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

  return (
    <SafeAreaView edges={edges} style={[styles.container, style]}>
      <View
        style={[
          styles.content,
          padded ? styles.padded : null,
          topPadding ? styles.topPadding : null,
          contentStyle
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  )
}

function createStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.semantic.background
    },
    content: {
      flex: 1
    },
    padded: {
      paddingHorizontal: 16
    },
    topPadding: {
      paddingTop: 8
    }
  })
}
