import React from 'react'
import { Pressable, Text, View } from 'react-native'
import type { Scope } from '../dashboard.model'
import type { DashboardStyles } from '../dashboard.styles'

export function DashboardScopeSegment(props: {
  value: Scope
  onChange: (scope: Scope) => void
  styles: DashboardStyles
}) {
  const { value, onChange, styles } = props

  return (
    <View style={styles.segment}>
      <Pressable
        onPress={() => onChange('month')}
        style={[styles.segmentBtn, value === 'month' ? styles.segmentBtnSelected : null]}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'month' }}
      >
        <Text style={styles.segmentText}>Month</Text>
      </Pressable>

      <Pressable
        onPress={() => onChange('year')}
        style={[styles.segmentBtn, value === 'year' ? styles.segmentBtnSelected : null]}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'year' }}
      >
        <Text style={styles.segmentText}>Year</Text>
      </Pressable>

      <Pressable
        onPress={() => onChange('all')}
        style={[styles.segmentBtn, value === 'all' ? styles.segmentBtnSelected : null]}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'all' }}
      >
        <Text style={styles.segmentText}>All</Text>
      </Pressable>
    </View>
  )
}
