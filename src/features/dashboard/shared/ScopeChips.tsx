import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useHoHTheme } from '@/providers'

import type { Scope } from '../types'
import { createScopeChipsStyles } from './ScopeChips.styles'

const SCOPES: ReadonlyArray<{ key: Scope; label: string }> = [
  { key: 'month', label: 'Monthly' },
  { key: 'year', label: 'Yearly' },
  { key: 'all', label: 'All' }
]

type Props = {
  value: Scope
  onChange: (scope: Scope) => void
}

export function ScopeChips({ value, onChange }: Props) {
  const theme = useHoHTheme()
  const styles = useMemo(() => createScopeChipsStyles(theme), [theme])

  return (
    <View style={styles.container}>
      {SCOPES.map((s) => {
        const isActive = s.key === value
        return (
          <Pressable
            key={s.key}
            onPress={() => onChange(s.key)}
            style={[styles.chip, isActive && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
