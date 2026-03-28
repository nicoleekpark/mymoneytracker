// ═══════════════════════════════════════════════════════════════════════════
// FEATURE SCREEN: Dashboard
// This is the main dashboard screen - an "orchestrator" that composes
// multiple sub-features (monthly, yearly, insights, assets, accounts).
// ═══════════════════════════════════════════════════════════════════════════

// ─── React & React Native ──────────────────────────────────────────────────
import React, { useMemo, useState } from 'react'
import { View } from 'react-native'

// ─── App-wide Shared Code ──────────────────────────────────────────────────
import { useHoHTheme } from '@/shared/providers'                    // Theme colors
import { useThemeColors, useExtendedThemeColors } from '@/shared/hooks/useThemeColors'
import { logError } from '@/shared/utils/logger'             // Centralized error logging
import { Screen } from '@/shared/layout/Screen'              // Screen wrapper component

// ─── Feature-local Imports ─────────────────────────────────────────────────
// These come from the same feature folder (./types, ./store, ./shared, etc.)
import { MODES } from './types'
import { useDashboardStore } from './store'  // Zustand store for dashboard state
import { createDashboardStyles } from './shared'  // Memoized styles factory
import { periodToYYYYMM } from './utils'  // Pure period formatting utility

// ─── Sub-feature Components ────────────────────────────────────────────────
// Each "body" is a complete sub-feature with its own data fetching
import { DashboardHeader } from './shared/DashboardHeader'
import { DashboardModeTabs } from './shared/DashboardModeTabs'
import { DashboardPeriodPicker } from './shared/DashboardPeriodPicker'
import { SwipeGestureWrapper } from './shared/SwipeGestureWrapper'
import { getFamilyMembers } from '@/core/services/asset'
import { AccountsBody } from './accounts'
import { AllBody } from './all'
import { AssetsBody, useAssetsNavigation } from './assets'
import { InsightsBody } from './insights'
import { MonthlyBody } from './monthly/MonthlyBody'
import { YearlyBody } from './yearly'

export default function DashboardScreen() {
  // ─── Step 1: Get Theme & Styles ────────────────────────────────────────────
  const theme = useHoHTheme()
  const styles = useMemo(() => createDashboardStyles(theme), [theme]) // Memoized = only recreate if theme changes

  // Color objects passed to child components (memoized to prevent re-renders)
  const standardColors = useThemeColors()      // Basic colors (text, border, surface)
  const extendedColors = useExtendedThemeColors() // + semantic colors (success, danger)

  // ─── Step 2: Get State from Zustand Store ──────────────────────────────────
  // useDashboardStore is a Zustand store (like useState but global)
  const {
    mode,               // 'overview' | 'insights' | 'assets' | 'accounts'
    scope,              // 'month' | 'year' | 'all'
    period,             // { year: 2024, month: 3 }
    selectedMemberIds,  // Which family members to filter by
    setMode,            // Function to change mode
    setScope,           // Function to change scope
    shiftPeriod,        // Function to go prev/next period
    setPeriod,          // Function to set specific period
    resetToToday,       // Function to reset to current month
    setSelectedMemberIds, // Function to set member filter
    canPrev,            // Can navigate to previous period?
    canNext             // Can navigate to next period?
  } = useDashboardStore()

  // ─── Step 3: Fetch Data ────────────────────────────────────────────────────
  // useState with lazy initializer - runs once on mount
  const [members] = useState<ReturnType<typeof getFamilyMembers>>(() => {
    try {
      return getFamilyMembers()
    } catch (e) {
      logError('Dashboard', e)
      return []
    }
  })

  // Memoized member list for child components (avoids creating new array on every render)
  const memberOptions = useMemo(
    () => members.map(m => ({ id: m.id, nickname: m.nickname })),
    [members]
  )

  const [pickerOpen, setPickerOpen] = useState(false)

  // ─── Step 4: Assets Navigation (data-driven) ─────────────────────────────
  // Assets mode navigates only to years with recorded data (not calendar-based)
  const assetsNav = useAssetsNavigation(period, setPeriod)

  function handleOpenPicker() {
    // Only block picker in overview mode when scope is 'all'
    if (mode === 'overview' && scope === 'all') return
    // Block picker for assets mode (data-driven years only)
    if (mode === 'assets') return
    setPickerOpen(true)
  }

  function handleSwipeLeft() {
    if (canNext()) {
      shiftPeriod(1)
    }
  }

  function handleSwipeRight() {
    if (canPrev()) {
      shiftPeriod(-1)
    }
  }

  const monthYYYYMM = periodToYYYYMM(period)

  return (
    <Screen edges={[]} padded={false}>
      <DashboardModeTabs
        modes={MODES}
        value={mode}
        onChange={setMode}
        styles={styles}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          UNIFIED HEADER
          ┌─────────────────────────────────────────────────────────────┐
          │  [Everyone] [Nicole] [Park]          <  Mar 2024  >         │
          │                 ↑                         ↑                 │
          │           members +                  period +               │
          │        selectedMemberIds          canPrev/canNext           │ 
          │        onSelectMembers            onPrev/onNext             │
          │                                   onOpenPicker              │
          ├─────────────────────────────────────────────────────────────┤
          │                    Today    Monthly  Yearly  All            │
          │                      ↑         ↑                            │
          │              scopeTabsProps.onToday                         │
          │              scopeTabsProps.scope                           │
          │              scopeTabsProps.onScopeChange                   │
          │              (only if showScopeTabs = true)                 │
          └─────────────────────────────────────────────────────────────┘
      ═══════════════════════════════════════════════════════════════════ */}
      <DashboardHeader
        // ─── Member Selection (same for all modes) ─────────────────────
        members={memberOptions} // List of family members [{id, nickname}]
        selectedMemberIds={selectedMemberIds} // Currently selected member IDs ([] = all)
        onSelectMembers={setSelectedMemberIds} // Callback when user taps a member chip 
        // ─── Period Display ────────────────────────────────────────────
        // Assets: always 'year' | Others: use store's scope
        scope={mode === 'assets' ? 'year' : scope}
        period={period} // Current period from store {year: 2024, month: 3} or {year: 2024}
        // ─── Navigation Arrows ─────────────────────────────────────────
        // Assets: data-driven (only years with data)
        // Others: calendar-driven (can't go past current month)
        canPrev={mode === 'assets' ? assetsNav.canPrev : canPrev()}
        canNext={mode === 'assets' ? assetsNav.canNext : canNext()}
        onPrev={mode === 'assets' ? assetsNav.onPrev : () => shiftPeriod(-1)}
        onNext={mode === 'assets' ? assetsNav.onNext : () => shiftPeriod(1)}
        // ─── Period Picker (disabled for Assets) ───────────────────────
        onOpenPicker={handleOpenPicker} // Opens month/year picker modal, disabled for Assets mode (see handleOpenPicker)
        // ─── Scope Tabs (only Overview & Accounts) ─────────────────────
        showScopeTabs={mode === 'overview' || mode === 'accounts'} // Only Overview and Accounts show the scope tabs
        scopeTabsProps={ // When tabs shown: pass current scope + change handler + "Today" button
          (mode === 'overview' || mode === 'accounts')
            ? { scope, onScopeChange: setScope, onToday: resetToToday }
            : undefined
        }
      />

      {/* Insights mode body */}
      {mode === 'insights' && (
        <View style={styles.body}>
          <InsightsBody
            monthYYYYMM={monthYYYYMM}
            colors={standardColors}
          />
        </View>
      )}

      {/* Assets mode - Net worth and asset tracking */}
      {mode === 'assets' && (
        <View style={styles.body}>
          <AssetsBody
            colors={standardColors}
            year={period.year}
            selectedMemberIds={selectedMemberIds}
          />
        </View>
      )}

      {/* Accounts mode body */}
      {mode === 'accounts' && (
        <SwipeGestureWrapper
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          canSwipeLeft={canNext()}
          canSwipeRight={canPrev()}
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
      )}

      {/* Overview mode - scope-based content */}
      {mode === 'overview' && (
        <SwipeGestureWrapper
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          canSwipeLeft={canNext()}
          canSwipeRight={canPrev()}
          enabled={scope !== 'all'}
        >
          <View style={styles.body}>
            {scope === 'month' && (
              <MonthlyBody
                monthYYYYMM={monthYYYYMM}
                colors={extendedColors}
              />
            )}
            {scope === 'year' && (
              <YearlyBody
                year={period.year}
                colors={standardColors}
                onMonthPress={(month) => {
                  setPeriod({ year: period.year, month })
                  setScope('month')
                }}
              />
            )}
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
