import { useHoHTheme } from '@/providers'
import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

type ScreenProps = Readonly<{
  children: React.ReactNode

  // file1처럼 top만 safe-area 잡고 싶으면 기본값을 ['top']로
  edges?: ReadonlyArray<Edge>

  // file1의 section paddingHorizontal:16 같은 “기본 좌우 패딩”
  padded?: boolean

  // file1처럼 topPadding(8)을 공통으로 넣고 싶으면 true
  topPadding?: boolean

  // Section wrapper를 안 쓰고 페이지에서 직접 padding을 주고 싶으면 false
  // (ex: full-bleed list, chart)
  contentStyle?: StyleProp<ViewStyle>

  // screen container 자체 스타일 추가
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.semantic.background }, style]} edges={edges}>
      <View
        style={[
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

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  padded: {
    paddingHorizontal: 16
  },
  topPadding: {
    paddingTop: 8
  }
})
