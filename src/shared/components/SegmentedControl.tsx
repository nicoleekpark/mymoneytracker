import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

export type SegmentOption<T extends string> = {
  label: string
  value: T
}

type Props<T extends string> = {
  value: T
  onChange: (v: T) => void
  options: ReadonlyArray<SegmentOption<T>>
}

/**
 * Underline-style segmented control (matches dashboard tabs)
 */
export function SegmentedControl<T extends string>({ value, onChange, options }: Props<T>) {
  const theme = useHoHTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: theme.semantic.border
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value

        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderBottomWidth: 2,
              borderBottomColor: selected ? theme.semantic.primary : 'transparent',
              marginBottom: -1
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text
              style={{
                fontSize: fontSize.md,
                color: selected ? theme.semantic.primary : theme.semantic.textSecondary,
                fontWeight: selected ? fontWeight.semibold : fontWeight.medium
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
