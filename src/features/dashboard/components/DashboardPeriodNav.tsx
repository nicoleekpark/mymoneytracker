import React from 'react'
import { Pressable, Text, View } from 'react-native'
import type { Scope } from '../dashboard.model'
import type { DashboardStyles } from '../dashboard.styles'

export function DashboardPeriodNav(props: {
  scope: Scope
  label: string
  onPrev: () => void
  onNext: () => void
  onPick: () => void
  styles: DashboardStyles
}) {
  const { scope, label, onPrev, onNext, onPick, styles } = props

  return (
    <View style={styles.periodControls}>
      {scope !== 'all' ? (
        <>
          <Pressable
            onPress={onPrev}
            style={[styles.iconBtn, styles.iconBtnLeft]}
            accessibilityRole="button"
            accessibilityLabel="Previous period"
          >
            <Text style={styles.iconBtnText}>◀</Text>
          </Pressable>

          <Pressable
            onPress={onPick}
            style={styles.periodBtn}
            accessibilityRole="button"
            accessibilityLabel="Pick period"
          >
            <Text style={styles.periodBtnText}>{label} ▼</Text>
          </Pressable>

          <Pressable
            onPress={onNext}
            style={[styles.iconBtn, styles.iconBtnRight]}
            accessibilityRole="button"
            accessibilityLabel="Next period"
          >
            <Text style={styles.iconBtnText}>▶</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.periodBtn}>
          <Text style={styles.periodBtnText}>{label}</Text>
        </View>
      )}
    </View>
  )
}
