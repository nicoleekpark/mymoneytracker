import React from 'react'
import { Pressable, Text, View } from 'react-native'
import type { Scope } from '../dashboard.model'
import type { DashboardStyles } from '../dashboard.styles'

export function DashboardScopeSegment(props: {
  value: Scope
  onChange: (s: Scope) => void
  styles: DashboardStyles
}) {
  const { value, onChange, styles } = props

  return (
    <View style={styles.segment}>
      {(['month', 'year', 'all'] as const).map((s) => {
        const selected = s === value
        return (
          <Pressable
            key={s}
            onPress={() => onChange(s)}
            style={[styles.segmentBtn, selected ? styles.segmentBtnSelected : null]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={styles.segmentText}>{s[0].toUpperCase() + s.slice(1)}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
