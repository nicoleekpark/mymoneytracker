import React, { useMemo, useReducer, useState } from 'react'
import { View } from 'react-native'

import { useHoHTheme } from '@/providers'
import { Screen } from '@/ui/layout/Screen'

import { MODES } from './dashboard.model'
import {
  createInitialDashboardState,
  dashboardReducer,
  selectCanNext,
  selectCanPrev,
  selectPeriodLabel
} from './dashboard.state'
import { createDashboardStyles } from './dashboard.styles'

import { DashboardModeTabs } from './components/DashboardModeTabs'
import { DashboardPeriodNav } from './components/DashboardPeriodNav'
import { DashboardPeriodPicker } from './components/DashboardPeriodPicker'
import { DashboardScopeSegment } from './components/DashboardScopeSegment'
import { MonthlyBody } from './components/monthly/MonthlyBody'

function selectMonthYYYYMM(state: { period: { year: number; month?: number } }) {
  const m = state.period.month ?? 1
  const mm = String(m).padStart(2, '0')
  return `${state.period.year}-${mm}`
}

export default function DashboardScreen() {
  const theme = useHoHTheme()
  const styles = useMemo(() => createDashboardStyles(theme), [theme])

  const [state, dispatch] = useReducer(dashboardReducer, undefined, createInitialDashboardState)
  const [pickerOpen, setPickerOpen] = useState(false)

  const periodLabel = selectPeriodLabel(state)
  const canPrev = selectCanPrev(state)
  const canNext = selectCanNext(state)

  function openPeriodPicker() {
    if (state.scope === 'all') return
    setPickerOpen(true)
  }

  return (
    <Screen topPadding>
      <DashboardModeTabs
        modes={MODES}
        value={state.mode}
        onChange={(mode) => dispatch({ type: 'SET_MODE', mode })}
        styles={styles}
      />

      <View style={styles.scopeRow}>
        <DashboardScopeSegment
          value={state.scope}
          onChange={(scope) => dispatch({ type: 'SET_SCOPE', scope })}
          styles={styles}
        />

        <DashboardPeriodNav
          scope={state.scope}
          label={periodLabel}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={() => dispatch({ type: 'SHIFT_PERIOD', delta: -1 })}
          onNext={() => dispatch({ type: 'SHIFT_PERIOD', delta: 1 })}
          onPick={openPeriodPicker}
          styles={styles}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        {state.scope === 'month' ? (
          <MonthlyBody
            monthYYYYMM={selectMonthYYYYMM(state)}
            colors={{
              text: theme.semantic.text,
              border: theme.semantic.border,
              surface: theme.semantic.surface,
              surfaceAlt: theme.semantic.surfaceAlt,
              primary: theme.semantic.primary,
              success: (theme.semantic as any).success ?? '#16a34a',
              danger: (theme.semantic as any).danger ?? '#dc2626'
            }}
          />
        ) : null}
      </View>

      <DashboardPeriodPicker
        visible={pickerOpen}
        scope={state.scope}
        onClose={() => setPickerOpen(false)}
        onSelect={(p) => {
          dispatch({ type: 'SET_PERIOD', period: p })
          setPickerOpen(false)
        }}
        styles={styles}
      />
    </Screen>
  )
}