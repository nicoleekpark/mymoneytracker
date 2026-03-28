import { spacing } from '@/shared/theme/tokens'
import React from 'react'
import { ScrollView, View, type ScrollViewProps, type ViewProps, StyleSheet } from 'react-native'

type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

type BaseStackProps = {
  children: React.ReactNode
  gap?: GapSize
}

type StackViewProps = BaseStackProps & ViewProps & {
  scroll?: false
}

type StackScrollProps = BaseStackProps & ScrollViewProps & {
  scroll: true
}

type StackProps = StackViewProps | StackScrollProps

const gapMap: Record<GapSize, number> = {
  none: spacing.none,
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
  '2xl': spacing['2xl'],
}

/**
 * Vertical stack with consistent spacing.
 *
 * @example
 * // Static stack
 * <Stack gap="lg">
 *   <Card />
 *   <Card />
 * </Stack>
 *
 * @example
 * // Scrollable stack
 * <Stack gap="xl" scroll>
 *   <Section1 />
 *   <Section2 />
 * </Stack>
 */
export function Stack(props: StackProps) {
  const { children, gap = 'md', scroll, style, ...rest } = props as StackScrollProps
  const gapValue = gapMap[gap]

  if (scroll) {
    const { contentContainerStyle, ...scrollProps } = rest as ScrollViewProps
    return (
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { gap: gapValue }, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    )
  }

  return (
    <View style={[{ gap: gapValue }, style]} {...(rest as ViewProps)}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: spacing['2xl'],
  },
})
