import React, { useMemo, useReducer } from 'react'
import { View } from 'react-native'

import { useHoHTheme } from '@/providers'
import { Screen } from '@/ui/layout/Screen'

import { MODES } from './dashboard.model'
import {
  createInitialDashboardState,
  dashboardReducer,
  getActiveScope,
  selectPeriodLabel,
} from './dashboard.state'
import { createDashboardStyles } from './dashboard.styles'

import {
  DashboardModeTabs,
  DashboardPeriodNav,
  DashboardScopeSegment,
} from './components'

export default function DashboardScreen() {
  const theme = useHoHTheme()
  const styles = useMemo(() => createDashboardStyles(theme), [theme])

  const [state, dispatch] = useReducer(dashboardReducer, undefined, createInitialDashboardState)

  const scope = getActiveScope(state)
  const periodLabel = selectPeriodLabel(state)

  function openPeriodPicker() {
    // v1 placeholder
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
          value={scope}
          onChange={(s) => dispatch({ type: 'SET_SCOPE', scope: s })}
          styles={styles}
        />

        <DashboardPeriodNav
          scope={scope}
          label={periodLabel}
          onPrev={() => dispatch({ type: 'SHIFT_PERIOD', delta: -1 })}
          onNext={() => dispatch({ type: 'SHIFT_PERIOD', delta: 1 })}
          onPick={openPeriodPicker}
          styles={styles}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        {/* body renderer (next step) */}
      </View>
    </Screen>
  )
}
