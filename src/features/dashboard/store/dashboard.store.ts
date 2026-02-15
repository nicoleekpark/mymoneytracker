import { create } from 'zustand'

import type { DashboardMode, Period, Scope } from '../types'
import {
  clampMonth,
  formatPeriodLabel,
  getMaxYearMonth,
  ymIndex
} from '../types'

export type DashboardState = {
  mode: DashboardMode
  scope: Scope
  period: Period
  selectedMemberIds: string[] // empty = All/Household
}

type DashboardActions = {
  setMode: (mode: DashboardMode) => void
  setScope: (scope: Scope) => void
  shiftPeriod: (delta: -1 | 1) => void
  setPeriod: (period: Period) => void
  resetToToday: () => void
  setSelectedMemberIds: (memberIds: string[]) => void
}

type DashboardSelectors = {
  getPeriodLabel: () => string
  canPrev: () => boolean
  canNext: () => boolean
}

export type DashboardStore = DashboardState & DashboardActions & DashboardSelectors

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

function createInitialState(): DashboardState {
  const max = getMaxYearMonth()
  return {
    mode: 'overview',
    scope: 'month',
    period: { year: max.year, month: max.month },
    selectedMemberIds: [] // Default to All/Household (empty = all)
  }
}

export const useDashboardStore = create<DashboardStore>()((set, get) => ({
  // Initial state
  ...createInitialState(),

  // Actions
  setMode: (mode) => set({ mode }),

  setScope: (scope) => {
    const state = get()
    const normalized = normalizeForScope(scope, state.period)
    const clamped = clampToMax(scope, normalized)
    set({ scope, period: clamped })
  },

  shiftPeriod: (delta) => {
    const state = get()
    const shifted = shift(state.scope, state.period, delta)
    set({ period: clampToMax(state.scope, shifted) })
  },

  setPeriod: (period) => {
    const state = get()
    const normalized = normalizeForScope(state.scope, period)
    set({ period: clampToMax(state.scope, normalized) })
  },

  resetToToday: () => {
    const state = get()
    const max = getMaxYearMonth()
    const todayPeriod = state.scope === 'year'
      ? { year: max.year }
      : { year: max.year, month: max.month }
    set({ period: todayPeriod })
  },

  setSelectedMemberIds: (memberIds) => set({ selectedMemberIds: memberIds }),

  // Selectors
  getPeriodLabel: () => {
    const state = get()
    return formatPeriodLabel(state.scope, state.period)
  },

  canPrev: () => {
    const state = get()
    return state.scope !== 'all'
  },

  canNext: () => {
    const state = get()
    const max = getMaxYearMonth()
    if (state.scope === 'all') return false
    if (state.scope === 'year') return state.period.year < max.year

    const month = 'month' in state.period ? clampMonth(state.period.month) : 1
    return ymIndex({ year: state.period.year, month }) < ymIndex(max)
  }
}))
