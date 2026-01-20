import React from 'react'
import { Pressable, Text, View } from 'react-native'
import type { Scope } from '../dashboard.model'
import type { DashboardStyles } from '../dashboard.styles'

export function DashboardPeriodNav(props: {
  scope: Scope
  label: string
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onPick: () => void
  styles: DashboardStyles
}) {
  const { scope, label, canPrev, canNext, onPrev, onNext, onPick, styles } = props
  const show = scope !== 'all'

  return (
    <View style={styles.periodControls}>
      {show ? (
        <>
          <Pressable
            onPress={onPrev}
            disabled={!canPrev}
            style={[styles.iconBtn, styles.iconBtnLeft, !canPrev ? { opacity: 0.35 } : null]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canPrev }}
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
            disabled={!canNext}
            style={[styles.iconBtn, styles.iconBtnRight, !canNext ? { opacity: 0.35 } : null]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canNext }}
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
