import { useHoHTheme } from '@/providers'
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

export function SegmentedControl<T extends string>({ value, onChange, options }: Props<T>) {
  const theme = useHoHTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: theme.semantic.border,
        backgroundColor: theme.semantic.surface,
        borderRadius: 12,
        overflow: 'hidden'
      }}
    >
      {options.map((opt, idx) => {
        const selected = opt.value === value

        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? theme.semantic.primarySoft : 'transparent',
              borderRightWidth: idx === options.length - 1 ? 0 : 1,
              borderRightColor: theme.semantic.border
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              style={{
                color: selected ? theme.semantic.primaryStrong : theme.semantic.textSecondary,
                fontWeight: selected ? '900' : '700'
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
