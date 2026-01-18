import type { DashboardMode, Period, Scope } from './dashboard.model'
import { clampMonth, formatPeriodLabel } from './dashboard.model'

export type DashboardState = {
  mode: DashboardMode
  scopeByMode: Record<DashboardMode, Scope>
  period: Period
}

export type DashboardAction =
  | { type: 'SET_MODE'; mode: DashboardMode }
  | { type: 'SET_SCOPE'; scope: Scope }
  | { type: 'SHIFT_PERIOD'; delta: -1 | 1 }

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

function normalizePeriodForScope(scope: Scope, p: Period): Period {
  if (scope === 'all') return { year: p.year }
  if (scope === 'year') return { year: p.year }

  const month = 'month' in p ? p.month : 1
  return { year: p.year, month: clampMonth(month) }
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

export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  const scope = getActiveScope(state)

  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode }

    case 'SET_SCOPE': {
      const nextScope = action.scope
      return {
        ...state,
        scopeByMode: { ...state.scopeByMode, [state.mode]: nextScope },
        period: normalizePeriodForScope(nextScope, state.period),
      }
    }

    case 'SHIFT_PERIOD':
      return { ...state, period: shiftPeriod(scope, state.period, action.delta) }

    default:
      return state
  }
}

export function selectPeriodLabel(state: DashboardState): string {
  const scope = getActiveScope(state)
  return formatPeriodLabel(scope, state.period)
}
