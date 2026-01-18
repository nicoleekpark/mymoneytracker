import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import type { DashboardMode } from '../dashboard.model'
import type { DashboardStyles } from '../dashboard.styles'

export function DashboardModeTabs(props: {
  modes: Array<{ key: DashboardMode; label: string }>
  value: DashboardMode
  onChange: (mode: DashboardMode) => void
  styles: DashboardStyles
}) {
  const { modes, value, onChange, styles } = props

  return (
    <View style={styles.modeRow}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {modes.map((m) => {
          const selected = m.key === value
          return (
            <Pressable
              key={m.key}
              onPress={() => onChange(m.key)}
              style={selected ? styles.pillSelected : styles.pill}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={selected ? styles.pillTextSelected : styles.pillText}>
                {m.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
