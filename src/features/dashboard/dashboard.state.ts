import type { DashboardMode, Period, Scope } from './dashboard.model'
import { clampMonth, getMaxYearMonth, ymIndex } from './dashboard.model'

export type DashboardState = Readonly<{
  mode: DashboardMode
  scope: Scope
  period: Period
}>

export type DashboardAction =
  | { type: 'SET_MODE'; mode: DashboardMode }
  | { type: 'SET_SCOPE'; scope: Scope }
  | { type: 'SHIFT_PERIOD'; delta: -1 | 1 }
  | { type: 'SET_PERIOD'; period: Period }

export function createInitialDashboardState(): DashboardState {
  const max = getMaxYearMonth()
  return {
    mode: 'overview',
    scope: 'month',
    period: { year: max.year, month: max.month }
  }
}

function normalizeForScope(scope: Scope, p: Period): Period {
  if (scope === 'all') return { year: p.year }
  if (scope === 'year') return { year: p.year }
  const month = 'month' in p ? p.month : 1
  return { year: p.year, month: clampMonth(month) }
}

function clampToMax(scope: Scope, p: Period): Period {
  const max = getMaxYearMonth()

  if (scope === 'all') return { year: p.year }
  if (scope === 'year') return { year: Math.min(p.year, max.year) }

  const month = 'month' in p ? clampMonth(p.month) : 1
  const cur = { year: p.year, month }
  if (ymIndex(cur) <= ymIndex(max)) return { year: p.year, month }
  return { year: max.year, month: max.month }
}

function shift(scope: Scope, p: Period, delta: -1 | 1): Period {
  if (scope === 'all') return p
  if (scope === 'year') return { year: p.year + delta }

  const y0 = p.year
  const m0 = 'month' in p ? clampMonth(p.month) : 1
  const m1 = m0 + delta

  if (m1 < 1) return { year: y0 - 1, month: 12 }
  if (m1 > 12) return { year: y0 + 1, month: 1 }
  return { year: y0, month: m1 }
}

export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode }

    case 'SET_SCOPE': {
      const nextScope = action.scope
      const normalized = normalizeForScope(nextScope, state.period)
      const clamped = clampToMax(nextScope, normalized)
      return { ...state, scope: nextScope, period: clamped }
    }

    case 'SHIFT_PERIOD': {
      const shifted = shift(state.scope, state.period, action.delta)
      return { ...state, period: clampToMax(state.scope, shifted) }
    }

    case 'SET_PERIOD': {
      const normalized = normalizeForScope(state.scope, action.period)
      return { ...state, period: clampToMax(state.scope, normalized) }
    }

    default:
      return state
  }
}

export function selectPeriodLabel(state: DashboardState): string {
  const { formatPeriodLabel } = require('./dashboard.model') as typeof import('./dashboard.model')
  return formatPeriodLabel(state.scope, state.period)
}

export function selectCanPrev(state: DashboardState): boolean {
  return state.scope !== 'all'
}

export function selectCanNext(state: DashboardState): boolean {
  const max = getMaxYearMonth()
  if (state.scope === 'all') return false
  if (state.scope === 'year') return state.period.year < max.year

  const month = 'month' in state.period ? clampMonth(state.period.month) : 1
  return ymIndex({ year: state.period.year, month }) < ymIndex(max)
}
