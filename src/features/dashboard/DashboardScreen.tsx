import React, { useMemo, useState } from 'react'
import { View } from 'react-native'

import { useHoHTheme } from '@/providers'
import { AppBar, Divider } from '@/shared/components'
import { Screen } from '@/shared/layout/Screen'

import type { Period } from './types'
import { MODES } from './types'
import { createDashboardStyles, useDashboardStore } from './store'

import { DashboardModeTabs } from './shared/DashboardModeTabs'
import { DashboardPeriodPicker } from './shared/DashboardPeriodPicker'
import { DashboardToolbar } from './shared/DashboardToolbar'
import { SwipeGestureWrapper } from './shared/SwipeGestureWrapper'
import { AllBody } from './all'
import { InsightsBody } from './insights'
import { MonthlyBody } from './monthly/MonthlyBody'
import { YearlyBody } from './yearly'

function periodToMonthYYYYMM(p: Period): string {
  if ('month' in p) {
    return `${p.year}-${String(p.month).padStart(2, '0')}`
  }
  return `${p.year}-01`
}

export default function DashboardScreen() {
  const theme = useHoHTheme()
  const styles = useMemo(() => createDashboardStyles(theme), [theme])

  const {
    mode,
    scope,
    period,
    setMode,
    setScope,
    shiftPeriod,
    setPeriod,
    resetToToday,
    canPrev,
    canNext
  } = useDashboardStore()

  const [pickerOpen, setPickerOpen] = useState(false)

  const canGoPrev = canPrev()
  const canGoNext = canNext()

  function handleOpenPicker() {
    if (scope === 'all') return
    setPickerOpen(true)
  }

  function handleSwipeLeft() {
    if (canGoNext) {
      shiftPeriod(1)
    }
  }

  function handleSwipeRight() {
    if (canGoPrev) {
      shiftPeriod(-1)
    }
  }

  const monthYYYYMM = periodToMonthYYYYMM(period)

  return (
    <Screen topPadding>
      <AppBar />

      <DashboardModeTabs
        modes={MODES}
        value={mode}
        onChange={setMode}
        styles={styles}
      />

      {/* Toolbar - only show for overview mode */}
      {mode === 'overview' && (
        <>
          <DashboardToolbar
            scope={scope}
            period={period}
            canPrev={canGoPrev}
            canNext={canGoNext}
            onPrev={() => shiftPeriod(-1)}
            onNext={() => shiftPeriod(1)}
            onOpenPicker={handleOpenPicker}
            onScopeChange={setScope}
            onToday={resetToToday}
          />
          <Divider spacing='sm'/>
        </>
      )}

      {/* Insights mode - Monthly only, no scope selector */}
      {mode === 'insights' && (
        <View style={styles.body}>
          <InsightsBody
            monthYYYYMM={monthYYYYMM}
            colors={{
              text: theme.semantic.text,
              textMuted: theme.semantic.textSecondary,
              border: theme.semantic.border,
              surface: theme.semantic.surface,
              surfaceAlt: theme.semantic.surfaceAlt,
              primary: theme.semantic.primary,
              success: theme.semantic.success,
              danger: theme.semantic.danger
            }}
          />
        </View>
      )}

      {/* Overview mode - scope-based content */}
      {mode === 'overview' && (
        <SwipeGestureWrapper
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          canSwipeLeft={canGoNext}
          canSwipeRight={canGoPrev}
          enabled={scope !== 'all'}
        >
          <View style={styles.body}>
            {/* Monthly - always mounted when scope is month or year for smooth transitions */}
            {(scope === 'month' || scope === 'year') && (
              <View style={scope === 'month' ? { flex: 1 } : { display: 'none' }}>
                <MonthlyBody
                  monthYYYYMM={monthYYYYMM}
                  colors={{
                    text: theme.semantic.text,
                    textMuted: theme.semantic.textSecondary,
                    border: theme.semantic.border,
                    surface: theme.semantic.background,
                    surfaceAlt: theme.semantic.surfaceAlt,
                    primary: theme.semantic.primary,
                    success: theme.semantic.success,
                    danger: theme.semantic.danger,
                    highlight: theme.semantic.highlight
                  }}
                />
              </View>
            )}
            {/* Yearly - always mounted when scope is month or year for smooth transitions */}
            {(scope === 'month' || scope === 'year') && (
              <View style={scope === 'year' ? { flex: 1 } : { display: 'none' }}>
                <YearlyBody
                  year={period.year}
                  colors={{
                    text: theme.semantic.text,
                    textMuted: theme.semantic.textSecondary,
                    border: theme.semantic.border,
                    surface: theme.semantic.background,
                    surfaceAlt: theme.semantic.surfaceAlt,
                    primary: theme.semantic.primary,
                    success: theme.semantic.success,
                    danger: theme.semantic.danger,
                    warning: theme.semantic.warning
                  }}
                />
              </View>
            )}
            {/* All - only mounted when needed */}
            {scope === 'all' && (
              <AllBody
                colors={{
                  text: theme.semantic.text,
                  textSecondary: theme.semantic.textSecondary,
                  border: theme.semantic.border,
                  surface: theme.semantic.surface,
                  surfaceAlt: theme.semantic.surfaceAlt,
                  primary: theme.semantic.primary,
                  success: theme.semantic.success,
                  danger: theme.semantic.danger
                }}
              />
            )}
          </View>
        </SwipeGestureWrapper>
      )}

      <DashboardPeriodPicker
        visible={pickerOpen}
        scope={scope}
        currentPeriod={period}
        onClose={() => setPickerOpen(false)}
        onSelect={(p) => {
          setPeriod(p)
          setPickerOpen(false)
        }}
      />
    </Screen>
  )
}
