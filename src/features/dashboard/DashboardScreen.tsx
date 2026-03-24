import React, { useMemo, useState } from 'react'
import { View } from 'react-native'

import { useHoHTheme } from '@/providers'
import { useThemeColors, useExtendedThemeColors } from '@/shared/hooks/useThemeColors'
import { Screen } from '@/shared/layout/Screen'

import type { Period } from './types'
import { MODES, getMaxYearMonth, ymIndex, clampMonth } from './types'
import { createDashboardStyles, useDashboardStore } from './store'

import { DashboardModeTabs } from './shared/DashboardModeTabs'
import { DashboardPeriodPicker } from './shared/DashboardPeriodPicker'
import { OverviewHeader } from './shared/OverviewHeader'
import { SwipeGestureWrapper } from './shared/SwipeGestureWrapper'
import { getFamilyMembers } from '@/domain/asset'
import { AccountsBody } from './accounts'
import { AllBody } from './all'
import { AssetsBody } from './assets'
import { InsightsBody, InsightsHeader } from './insights'
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

  // Memoized color objects to prevent unnecessary child re-renders
  const standardColors = useThemeColors()
  const extendedColors = useExtendedThemeColors()

  const {
    mode,
    scope,
    period,
    selectedMemberIds,
    setMode,
    setScope,
    shiftPeriod,
    setPeriod,
    resetToToday,
    setSelectedMemberIds,
    canPrev,
    canNext
  } = useDashboardStore()

  // Get family members for filtering
  const members = useMemo(() => {
    try {
      return getFamilyMembers()
    } catch {
      return []
    }
  }, [])

  const [pickerOpen, setPickerOpen] = useState(false)

  // For Insights mode, always use monthly scope logic for navigation
  const canGoPrev = mode === 'insights' ? true : canPrev()
  const canGoNext = useMemo(() => {
    if (mode === 'insights') {
      const max = getMaxYearMonth()
      const month = 'month' in period ? clampMonth(period.month) : 1
      return ymIndex({ year: period.year, month }) < ymIndex(max)
    }
    return canNext()
  }, [mode, period, canNext])

  function handleOpenPicker() {
    // Only block picker in overview mode when scope is 'all'
    if (mode === 'overview' && scope === 'all') return
    setPickerOpen(true)
  }

  // Shift period with monthly logic (used for Insights mode)
  function shiftMonthlyPeriod(delta: -1 | 1) {
    const y0 = period.year
    const m0 = 'month' in period ? clampMonth(period.month) : 1
    const m1 = m0 + delta

    let newPeriod: Period
    if (m1 < 1) {
      newPeriod = { year: y0 - 1, month: 12 }
    } else if (m1 > 12) {
      newPeriod = { year: y0 + 1, month: 1 }
    } else {
      newPeriod = { year: y0, month: m1 }
    }

    // Clamp to max
    const max = getMaxYearMonth()
    const newMonth = 'month' in newPeriod ? newPeriod.month : 1
    if (ymIndex({ year: newPeriod.year, month: newMonth }) > ymIndex(max)) {
      newPeriod = { year: max.year, month: max.month }
    }

    setPeriod(newPeriod)
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
    <Screen edges={[]} padded={false}>
      <DashboardModeTabs
        modes={MODES}
        value={mode}
        onChange={setMode}
        styles={styles}
      />

      {/* Overview Header - members + period + scope */}
      {mode === 'overview' && (
        <OverviewHeader
          members={members.map(m => ({ id: m.id, nickname: m.nickname }))}
          selectedMemberIds={selectedMemberIds}
          onSelectMembers={setSelectedMemberIds}
          scope={scope}
          period={period}
          canPrev={canGoPrev}
          canNext={canGoNext}
          onPrev={() => shiftPeriod(-1)}
          onNext={() => shiftPeriod(1)}
          onOpenPicker={handleOpenPicker}
          onToday={resetToToday}
          onScopeChange={setScope}
        />
      )}

      {/* Insights mode - Monthly only with member selector */}
      {mode === 'insights' && (
        <>
          <InsightsHeader
            members={members.map(m => ({ id: m.id, nickname: m.nickname }))}
            selectedMemberIds={selectedMemberIds}
            onSelectMembers={setSelectedMemberIds}
            period={period}
            canPrev={canGoPrev}
            canNext={canGoNext}
            onPrev={() => shiftMonthlyPeriod(-1)}
            onNext={() => shiftMonthlyPeriod(1)}
            onOpenPicker={handleOpenPicker}
          />
          <View style={styles.body}>
            <InsightsBody
              monthYYYYMM={monthYYYYMM}
              colors={standardColors}
            />
          </View>
        </>
      )}

      {/* Assets mode - Net worth and asset tracking */}
      {mode === 'assets' && (
        <View style={styles.body}>
          <AssetsBody colors={standardColors} />
        </View>
      )}

      {/* Accounts mode - Account activity tracking */}
      {mode === 'accounts' && (
        <>
          <OverviewHeader
            members={members.map(m => ({ id: m.id, nickname: m.nickname }))}
            selectedMemberIds={selectedMemberIds}
            onSelectMembers={setSelectedMemberIds}
            scope={scope}
            period={period}
            canPrev={canGoPrev}
            canNext={canGoNext}
            onPrev={() => shiftPeriod(-1)}
            onNext={() => shiftPeriod(1)}
            onOpenPicker={handleOpenPicker}
            onToday={resetToToday}
            onScopeChange={setScope}
          />
          <SwipeGestureWrapper
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            canSwipeLeft={canGoNext}
            canSwipeRight={canGoPrev}
            enabled={scope !== 'all'}
          >
            <View style={styles.body}>
              <AccountsBody
                scope={scope}
                period={period}
                colors={standardColors}
              />
            </View>
          </SwipeGestureWrapper>
        </>
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
                  colors={extendedColors}
                />
              </View>
            )}
            {/* Yearly - always mounted when scope is month or year for smooth transitions */}
            {(scope === 'month' || scope === 'year') && (
              <View style={scope === 'year' ? { flex: 1 } : { display: 'none' }}>
                <YearlyBody
                  year={period.year}
                  colors={standardColors}
                  onMonthPress={(month) => {
                    setPeriod({ year: period.year, month })
                    setScope('month')
                  }}
                />
              </View>
            )}
            {/* All - only mounted when needed */}
            {scope === 'all' && (
              <AllBody colors={standardColors} />
            )}
          </View>
        </SwipeGestureWrapper>
      )}

      <DashboardPeriodPicker
        visible={pickerOpen}
        scope={mode === 'insights' ? 'month' : scope}
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
