import React, { useMemo } from 'react'
import { Text, View } from 'react-native'

import { useHoHTheme } from '@/providers'
import { useThemeStore } from '@/store'
import type { ThemeMode } from '@/theme'
import { SegmentedControl } from '@/ui/components/SegmentedControl'

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
      <Text style={{ color: theme.semantic.text, fontSize: 20, fontWeight: '900', marginBottom: 12 }}>
        Settings
      </Text>

      <Text style={{ color: theme.semantic.textSecondary, fontSize: 13, fontWeight: '800', marginBottom: 10 }}>
        Theme
      </Text>

      <SegmentedControl value={selection} onChange={onChange} options={options} />
    </View>
  )
}
