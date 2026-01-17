import { useHoHTheme } from '@/providers'
import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { Screen } from '@/ui/layout/Screen'
import type { DashboardMode, Period, Scope } from './dashboard.model'
import { MODES, clampMonth, formatPeriodLabel } from './dashboard.model'

export default function DashboardScreen() {
  const theme = useHoHTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

  const [mode, setMode] = useState<DashboardMode>('overview')
  const [scope, setScope] = useState<Scope>('month')
  const [period, setPeriod] = useState<Period>({ year: 2026, month: 1 })

  const periodLabel = formatPeriodLabel(scope, period)

  function onScopeChange(next: Scope) {
    setScope(next)

    if (next === 'all') return
    if (next === 'year') {
      setPeriod((p) => ({ year: p.year }))
      return
    }
    setPeriod((p) => ({ year: p.year, month: clampMonth(p.month ?? 1) }))
  }

  function shiftPeriod(delta: -1 | 1) {
    if (scope === 'all') return

    if (scope === 'year') {
      setPeriod((p) => ({ year: p.year + delta }))
      return
    }

    setPeriod((p) => {
      const m0 = clampMonth(p.month ?? 1)
      const y0 = p.year
      const m1 = m0 + delta
      if (m1 < 1) return { year: y0 - 1, month: 12 }
      if (m1 > 12) return { year: y0 + 1, month: 1 }
      return { year: y0, month: m1 }
    })
  }

  function openPeriodPicker() {
    // v1 placeholder
  }

  return (
    <Screen topPadding>
      <View style={styles.modeRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MODES.map((m) => {
            const selected = m.key === mode
            return (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
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

      <View style={styles.scopeRow}>
        <View style={styles.segment}>
          <Pressable
            onPress={() => onScopeChange('month')}
            style={[styles.segmentBtn, scope === 'month' ? styles.segmentBtnSelected : null]}
            accessibilityRole="button"
            accessibilityState={{ selected: scope === 'month' }}
          >
            <Text style={styles.segmentText}>Month</Text>
          </Pressable>

          <Pressable
            onPress={() => onScopeChange('year')}
            style={[styles.segmentBtn, scope === 'year' ? styles.segmentBtnSelected : null]}
            accessibilityRole="button"
            accessibilityState={{ selected: scope === 'year' }}
          >
            <Text style={styles.segmentText}>Year</Text>
          </Pressable>

          <Pressable
            onPress={() => onScopeChange('all')}
            style={[styles.segmentBtn, scope === 'all' ? styles.segmentBtnSelected : null]}
            accessibilityRole="button"
            accessibilityState={{ selected: scope === 'all' }}
          >
            <Text style={styles.segmentText}>All</Text>
          </Pressable>
        </View>

        <View style={styles.periodControls}>
          {scope !== 'all' ? (
            <>
              <Pressable
                onPress={() => shiftPeriod(-1)}
                style={[styles.iconBtn, styles.iconBtnLeft]}
                accessibilityRole="button"
                accessibilityLabel="Previous period"
              >
                <Text style={styles.iconBtnText}>◀</Text>
              </Pressable>

              <Pressable
                onPress={openPeriodPicker}
                style={styles.periodBtn}
                accessibilityRole="button"
                accessibilityLabel="Pick period"
              >
                <Text style={styles.periodBtnText}>{periodLabel} ▼</Text>
              </Pressable>

              <Pressable
                onPress={() => shiftPeriod(1)}
                style={[styles.iconBtn, styles.iconBtnRight]}
                accessibilityRole="button"
                accessibilityLabel="Next period"
              >
                <Text style={styles.iconBtnText}>▶</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.periodBtn}>
              <Text style={styles.periodBtnText}>{periodLabel}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        {/* body renderer (next step) */}
      </View>
    </Screen>
  )
}

function createStyles(theme: ReturnType<typeof useHoHTheme>) {
  const onPrimary = '#FFFFFF'

  return StyleSheet.create({
    modeRow: {
      paddingBottom: 10
    },

    pill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
      backgroundColor: theme.semantic.surface,
      borderColor: theme.semantic.border
    },

    pillSelected: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
      backgroundColor: theme.semantic.primary,
      borderColor: theme.semantic.primary
    },

    pillText: {
      color: theme.semantic.text,
      fontSize: 13,
      fontWeight: '600'
    },

    pillTextSelected: {
      color: onPrimary,
      fontSize: 13,
      fontWeight: '700'
    },

    scopeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      gap: 10
    },

    segment: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.semantic.border,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: theme.semantic.surface
    },

    segmentBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: 'transparent'
    },

    segmentBtnSelected: {
      backgroundColor: theme.semantic.surfaceAlt
    },

    segmentText: {
      color: theme.semantic.text,
      fontSize: 13,
      fontWeight: '600'
    },

    periodControls: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0
    },

    iconBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.semantic.border,
      backgroundColor: theme.semantic.surface
    },

    iconBtnLeft: {
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10
    },

    iconBtnRight: {
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10
    },

    iconBtnText: {
      color: theme.semantic.text,
      fontSize: 12,
      fontWeight: '700'
    },

    periodBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.semantic.border,
      backgroundColor: theme.semantic.surface
    },

    periodBtnText: {
      color: theme.semantic.text,
      fontSize: 13,
      fontWeight: '600'
    },

    divider: {
      height: 1,
      backgroundColor: theme.semantic.border
    },

    body: {
      flex: 1,
      paddingTop: 14
    }
  })
}
