import type { DashboardMode, Period, Scope } from './dashboard.model'
import { clampMonth, formatPeriodLabel, getMonthYYYYMMFromPeriod } from './dashboard.model'

export type DashboardState = {
  mode: DashboardMode
  scopeByMode: Record<DashboardMode, Scope>
  period: Period
}

type YearMonth = { year: number; month: number }

export type DashboardAction =
  | { type: 'SET_MODE'; mode: DashboardMode }
  | { type: 'SET_SCOPE'; scope: Scope }
  | { type: 'SHIFT_PERIOD'; delta: -1 | 1 }
  | { type: 'SET_PERIOD'; period: Period }

export function createInitialDashboardState(): DashboardState {
  return {
    mode: 'overview',
    scopeByMode: {
      overview: 'month',
      cashflow: 'month',
      accounts: 'month',
      networth: 'month',
    },
    period: { year: 2026, month: 1 },
  }
}

export function getActiveScope(state: DashboardState): Scope {
  return state.scopeByMode[state.mode]
}

function shiftPeriod(scope: Scope, p: Period, delta: -1 | 1): Period {
  if (scope === 'all') return p

  if (scope === 'year') {
    return { year: p.year + delta }
  }

  const y0 = p.year
  const m0 = 'month' in p ? clampMonth(p.month) : 1
  const m1 = m0 + delta

  if (m1 < 1) return { year: y0 - 1, month: 12 }
  if (m1 > 12) return { year: y0 + 1, month: 1 }
  return { year: y0, month: m1 }
}

export function selectPeriodLabel(state: DashboardState): string {
  const scope = getActiveScope(state)
  return formatPeriodLabel(scope, state.period)
}

export function selectActiveMonthYYYYMM(state: DashboardState): string | null {
  const scope = getActiveScope(state)
  return getMonthYYYYMMFromPeriod(scope, state.period)
}

function getMaxYearMonth(now = new Date()): YearMonth {
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function ymIndex(ym: YearMonth) {
  return ym.year * 12 + (ym.month - 1)
}

function normalizePeriodForScope(scope: Scope, p: Period): Period {
  if (scope === 'all') return { year: p.year }
  if (scope === 'year') return { year: p.year }
  const month = 'month' in p ? p.month : 1
  return { year: p.year, month: clampMonth(month) }
}

function clampToMax(scope: Scope, p: Period, max: YearMonth): Period {
  if (scope === 'all') return { year: p.year }
  if (scope === 'year') return { year: Math.min(p.year, max.year) }

  const m = 'month' in p ? clampMonth(p.month) : 1
  const cur = { year: p.year, month: m }
  if (ymIndex(cur) <= ymIndex(max)) return { year: p.year, month: m }
  return { year: max.year, month: max.month }
}

export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  const scope = getActiveScope(state)
  const max = getMaxYearMonth()

  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode }

    case 'SET_SCOPE': {
      const nextScope = action.scope
      const nextPeriod = clampToMax(nextScope, normalizePeriodForScope(nextScope, state.period), max)
      return {
        ...state,
        scopeByMode: { ...state.scopeByMode, [state.mode]: nextScope },
        period: nextPeriod,
      }
    }

    case 'SHIFT_PERIOD': {
      const shifted = shiftPeriod(scope, state.period, action.delta)
      return { ...state, period: clampToMax(scope, shifted, max) }
    }

    case 'SET_PERIOD': {
      const next = clampToMax(scope, normalizePeriodForScope(scope, action.period), max)
      return { ...state, period: next }
    }

    default:
      return state
  }
}

export function selectCanPrev(state: DashboardState): boolean {
  return getActiveScope(state) !== 'all'
}

export function selectCanNext(state: DashboardState): boolean {
  const scope = getActiveScope(state)
  const max = getMaxYearMonth()

  if (scope === 'all') return false
  if (scope === 'year') return state.period.year < max.year

  if (!('month' in state.period)) return true
  const cur = { year: state.period.year, month: clampMonth(state.period.month) }
  return ymIndex(cur) < ymIndex(max)
}