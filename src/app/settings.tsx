import React, { useMemo } from 'react'
import { Text, View } from 'react-native'

import { useHoHTheme } from '@/providers'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { useThemeStore } from '@/store'
import type { ThemeMode } from '@/theme'
import { SegmentedControl } from '@/shared/components/SegmentedControl'

type ThemeSelection = ThemeMode | 'system'

export default function SettingsScreen() {
  const theme = useHoHTheme()

  const mode = useThemeStore((t) => t.mode) // ThemeMode | null
  const setMode = useThemeStore((t) => t.setMode)

  const selection: ThemeSelection = mode ?? 'system'

  const options = useMemo(
    () => [
      { label: 'Light', value: 'light' as const },
      { label: 'Dark', value: 'dark' as const },
      { label: 'System', value: 'system' as const }
    ],
    []
  )

  const onChange = (next: ThemeSelection) => {
    if (next === 'system') setMode(null)
    else setMode(next)
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.semantic.background }}>
      <Text style={{ color: theme.semantic.text, fontSize: fontSize['2xl'], fontWeight: fontWeight.black, marginBottom: 12 }}>
        Settings
      </Text>

      <Text style={{ color: theme.semantic.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.heavy, marginBottom: 10 }}>
        Theme
      </Text>

      <SegmentedControl value={selection} onChange={onChange} options={options} />
    </View>
  )
}
