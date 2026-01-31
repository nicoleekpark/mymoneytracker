import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useHoHTheme } from '@/providers'

import type { Period, Scope } from '../types'
import { formatPeriodLabelFull, isCurrentPeriod } from '../types'
import { createDashboardToolbarStyles } from './DashboardToolbar.styles'
import { ScopeChips } from './ScopeChips'

type Props = {
  scope: Scope
  period: Period
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onOpenPicker: () => void
  onScopeChange: (scope: Scope) => void
  onToday: () => void
}

export function DashboardToolbar(props: Props) {
  const {
    scope,
    period,
    canPrev,
    canNext,
    onPrev,
    onNext,
    onOpenPicker,
    onScopeChange,
    onToday
  } = props

  const theme = useHoHTheme()
  const styles = useMemo(() => createDashboardToolbarStyles(theme), [theme])
  const isCurrent = isCurrentPeriod(scope, period)
  const periodLabel = formatPeriodLabelFull(scope, period)
  const showNav = scope !== 'all'

  return (
    <View style={styles.toolbar}>
      {/* Left: Period Navigation */}
      <View style={styles.periodSection}>
        {showNav && (
          <Pressable
            onPress={onPrev}
            disabled={!canPrev}
            style={[styles.chevronBtn, !canPrev && styles.chevronBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Previous period"
            accessibilityState={{ disabled: !canPrev }}
          >
            <Text style={styles.chevronText}>{'‹'}</Text>
          </Pressable>
        )}

        <Pressable
          onPress={showNav ? onOpenPicker : undefined}
          style={styles.periodBtn}
          accessibilityRole="button"
          accessibilityLabel="Select period"
          disabled={!showNav}
        >
          <Text style={styles.periodText}>{periodLabel}</Text>
        </Pressable>

        {showNav && (
          <Pressable
            onPress={onNext}
            disabled={!canNext}
            style={[styles.chevronBtn, !canNext && styles.chevronBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Next period"
            accessibilityState={{ disabled: !canNext }}
          >
            <Text style={styles.chevronText}>{'›'}</Text>
          </Pressable>
        )}
      </View>

      {/* Right: Today + Scope */}
      <View style={styles.actions}>
        {!isCurrent && scope !== 'all' && (
          <Pressable
            onPress={onToday}
            style={styles.todayChip}
            accessibilityRole="button"
            accessibilityLabel="Go to today"
          >
            <Text style={styles.todayText}>Today</Text>
          </Pressable>
        )}

        <ScopeChips value={scope} onChange={onScopeChange} />
      </View>
    </View>
  )
}
