import { useEffect, useState } from 'react'

import {
  getMonthlySummaryDollar,
  getMonthlyExpenseByCategoryDollar,
  getDailyFlowDollarForMonth,
  type MonthlySummaryDollar,
  type DailyFlowDollar
} from '@/domain/transaction/transaction.usecase'
import { formatSignedUsdCompact } from '@/shared/format/currency'
import { CATEGORIES } from '@/config/categories.config'

import type {
  InsightsData,
  InsightCardData,
  InsightsSummary,
  SummaryPill,
  PillTone,
  NetTrendPoint,
  WeekdaySpend,
  CategoryComparison,
  DailyOutflow
} from '../insights.types'

// Get previous N months as YYYY-MM strings
function getPrevMonths(fromYYYYMM: string, count: number): string[] {
  const result: string[] = []
  let [y, m] = fromYYYYMM.split('-').map(Number)

  for (let i = 0; i < count; i++) {
    m--
    if (m < 1) {
      m = 12
      y--
    }
    result.push(`${y}-${String(m).padStart(2, '0')}`)
  }

  return result
}

// Get display name for category
function getCategoryDisplayName(categoryName: string | null): string {
  if (!categoryName) return 'Uncategorized'
  return categoryName
}

// Calculate median
function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.floor((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

// Calculate standard deviation
function stdDev(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
}

// Calculate coefficient of variation (std dev / mean) as percentage
function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (mean === 0) return 0
  return (stdDev(values) / mean) * 100
}

// Low spend threshold (e.g., $20 or less is considered "quiet")
const LOW_SPEND_THRESHOLD = 20
// Minimum driver delta to show (per spec)
const MIN_DRIVER_ABS_DOLLARS = 200

const DEFAULT_SUMMARY: InsightsSummary = {
  pills: [],
  netCents: 0,
  baselineNetCents: null,
  driverCategory: null,
  driverDeltaCents: null,
  dataQuality: 'incomplete',
  unknownDayCount: 0
}

const DEFAULT_DATA: InsightsData = {
  summary: DEFAULT_SUMMARY,
  insights: [],
  categoryComparison: [],
  netTrend: [],
  weekdayPattern: [],
  dailyOutflow: [],
  medianNet: null,
  monthYYYYMM: '',
  hasEnoughData: false
}

export function useInsightsData(monthYYYYMM: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<InsightsData>(DEFAULT_DATA)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        // Get previous 12 months for baseline calculation (per spec)
        const prevMonths = getPrevMonths(monthYYYYMM, 12)
        const lastMonthYYYYMM = prevMonths[0]

        // Fetch all data in parallel
        const [
          currentSummary,
          lastMonthSummary,
          currentExpenseByCategory,
          lastMonthExpenseByCategory,
          currentDailyFlow,
          ...prevMonthsData
        ] = await Promise.all([
          getMonthlySummaryDollar(monthYYYYMM),
          getMonthlySummaryDollar(lastMonthYYYYMM).catch(() => null),
          getMonthlyExpenseByCategoryDollar(monthYYYYMM),
          getMonthlyExpenseByCategoryDollar(lastMonthYYYYMM).catch(() => []),
          getDailyFlowDollarForMonth(monthYYYYMM),
          // Fetch summary, daily flow, and category expenses for previous months
          ...prevMonths.slice(0, 11).flatMap(m => [
            getMonthlySummaryDollar(m).catch(() => null),
            getDailyFlowDollarForMonth(m).catch(() => [] as DailyFlowDollar[]),
            getMonthlyExpenseByCategoryDollar(m).catch(() => [])
          ])
        ])

        // Separate prev months data into summaries, daily flows, and category expenses
        const prevSummaries: (MonthlySummaryDollar | null)[] = []
        const prevDailyFlows: DailyFlowDollar[][] = []
        const prevCategoryExpenses: { categoryId: string | null; totalDollar: number }[][] = []
        for (let i = 0; i < prevMonthsData.length; i += 3) {
          prevSummaries.push(prevMonthsData[i] as MonthlySummaryDollar | null)
          prevDailyFlows.push((prevMonthsData[i + 1] || []) as DailyFlowDollar[])
          prevCategoryExpenses.push((prevMonthsData[i + 2] || []) as { categoryId: string | null; totalDollar: number }[])
        }

        if (!alive) return

        // Check if we have enough data
        const hasData = currentSummary.incomeTotalDollar > 0 || currentSummary.expenseTotalDollar > 0
        const hasLastMonth = lastMonthSummary !== null &&
          (lastMonthSummary.incomeTotalDollar > 0 || lastMonthSummary.expenseTotalDollar > 0)

        // Valid previous summaries for baseline
        const validPrevSummaries = [lastMonthSummary, ...prevSummaries]
          .filter((s): s is MonthlySummaryDollar => s !== null)

        // === CALCULATE BASELINE ===
        const baselineNetDollar = validPrevSummaries.length >= 3
          ? median(validPrevSummaries.map(s => s.netCashFlowDollar))
          : null

        // === FIND PRIMARY DRIVER (merged: what changed + why) ===
        let driverCategory: string | null = null
        let driverDeltaDollar: number | null = null
        let driverConfidence: 'high' | 'low' = 'low'

        if (hasLastMonth && lastMonthSummary && currentExpenseByCategory.length > 0) {
          // Build maps with both total and name by categoryId
          const currentByKey = new Map(currentExpenseByCategory.map(c => [c.categoryId, { total: c.totalDollar, name: c.categoryName }]))
          const lastByKey = new Map(lastMonthExpenseByCategory.map(c => [c.categoryId, { total: c.totalDollar, name: c.categoryName }]))

          // Calculate delta for each category
          const allCategories = new Set([...currentByKey.keys(), ...lastByKey.keys()])
          const categoryDeltas: { catId: string | null; name: string; delta: number }[] = []

          for (const catId of allCategories) {
            const curr = currentByKey.get(catId)?.total || 0
            const last = lastByKey.get(catId)?.total || 0
            const delta = curr - last
            // Get name from current or last month data
            const name = getCategoryDisplayName(currentByKey.get(catId)?.name ?? lastByKey.get(catId)?.name ?? null)
            categoryDeltas.push({ catId, name, delta })
          }

          // Sort by absolute delta descending
          categoryDeltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

          if (categoryDeltas.length > 0) {
            const top = categoryDeltas[0]
            const totalOutflowDelta = currentSummary.expenseTotalDollar - (lastMonthSummary?.expenseTotalDollar || 0)

            // Per spec: hide if < $200 or < 30% of total outflow delta
            const meetsAbsThreshold = Math.abs(top.delta) >= MIN_DRIVER_ABS_DOLLARS
            const meetsRelThreshold = Math.abs(totalOutflowDelta) > 0
              ? Math.abs(top.delta) >= 0.30 * Math.abs(totalOutflowDelta)
              : false

            if (meetsAbsThreshold || meetsRelThreshold) {
              driverCategory = top.name
              driverDeltaDollar = top.delta

              // High confidence if top delta is clearly separated from #2
              if (categoryDeltas.length > 1) {
                const secondDelta = Math.abs(categoryDeltas[1].delta)
                driverConfidence = Math.abs(top.delta) > secondDelta * 1.5 ? 'high' : 'low'
              } else {
                driverConfidence = 'high'
              }
            }
          }
        }

        // === DATA QUALITY ===
        // Count days with no transactions (unknown days)
        const daysInMonth = new Date(
          parseInt(monthYYYYMM.split('-')[0]),
          parseInt(monthYYYYMM.split('-')[1]),
          0
        ).getDate()
        const daysWithTx = new Set(currentDailyFlow.map(d => d.day)).size
        const unknownDayCount = daysInMonth - daysWithTx

        let dataQuality: InsightsSummary['dataQuality'] = 'incomplete'
        if (unknownDayCount === 0) {
          dataQuality = 'complete'
        } else if (unknownDayCount <= 3) {
          dataQuality = 'mostly_complete'
        }

        // === BUILD SUMMARY PILLS ===
        // Hero focuses on "vs Typical" to differentiate from Overview (which shows absolute net)
        const pills: SummaryPill[] = []

        const netDollar = currentSummary.netCashFlowDollar
        const vsBaseline = baselineNetDollar !== null ? netDollar - baselineNetDollar : null

        // Tone based on delta (vs typical), not absolute net
        const netTone: PillTone = vsBaseline !== null
          ? (vsBaseline > 0 ? 'positive' : vsBaseline < 0 ? 'negative' : 'neutral')
          : 'neutral'

        // P1: vs Typical (hero) - shows DELTA as primary to differentiate from Overview
        // Overview shows "Net: $X", Insights shows "vs Typical: +$X"
        pills.push({
          id: 'net_vs_baseline',
          label: 'vs Typical',
          value: {
            primary: vsBaseline !== null
              ? formatSignedUsdCompact(vsBaseline)
              : formatSignedUsdCompact(netDollar),
            secondary: vsBaseline !== null
              ? (vsBaseline >= 0 ? 'better than typical' : 'worse than typical')
              : 'Not enough history'
          },
          tone: netTone,
          size: 'large',
          isVisible: true
        })

        // P2: Data Quality - shows data completeness
        // Driver pill REMOVED - redundant with primary-driver insight card below
        pills.push({
          id: 'data_quality',
          label: 'Data',
          value: {
            primary: unknownDayCount === 0 ? 'Complete' : `${unknownDayCount} gaps`
          },
          tone: dataQuality === 'complete' ? 'neutral' : 'warning',
          isVisible: true
        })

        // ═══════════════════════════════════════════════════════════════════════
        // BUILD FLAT INSIGHTS LIST
        // Badge system: only 'caution' (amber triangle) and 'alert' (red circle)
        // Most insights have NO badge - let content speak for itself
        // ═══════════════════════════════════════════════════════════════════════
        const insights: InsightCardData[] = []

        // -----------------------------------------------------------------------
        // 1. PRIMARY DRIVER (no badge - content is self-explanatory)
        // -----------------------------------------------------------------------
        if (hasLastMonth && lastMonthSummary) {
          const netChange = currentSummary.netCashFlowDollar - lastMonthSummary.netCashFlowDollar
          const arrow = netChange >= 0 ? '↑' : '↓'
          const driverLine = driverCategory && driverDeltaDollar
            ? `\nDriver: ${driverCategory} ${formatSignedUsdCompact(driverDeltaDollar)}`
            : ''

          insights.push({
            id: 'primary-driver',
            type: 'driver',
            title: 'Primary driver',
            body: `Net ${arrow} ${formatSignedUsdCompact(Math.abs(netChange))} vs last month${driverLine}`,
            sub: undefined,
            evidence: [
              ...(driverCategory && driverDeltaDollar ? [
                { key: 'Change', value: `${driverCategory} ${formatSignedUsdCompact(driverDeltaDollar)}` }
              ] : []),
              { key: 'This month', value: formatSignedUsdCompact(currentSummary.netCashFlowDollar) },
              { key: 'Last month', value: formatSignedUsdCompact(lastMonthSummary.netCashFlowDollar) }
            ],
            ctas: [
              { label: 'See drivers', variant: 'primary' },
              { label: 'Open category', variant: 'ghost' }
            ],
            explanation: {
              calculation: 'Largest category delta vs last month.',
              whatMatters: 'Identifies where the change came from.'
            }
          })
        }

        // -----------------------------------------------------------------------
        // 2. BASELINE (no badge - content is self-explanatory)
        // -----------------------------------------------------------------------
        if (baselineNetDollar !== null) {
          insights.push({
            id: 'baseline',
            type: 'baseline',
            title: 'Typical',
            body: `Typical month: ${formatSignedUsdCompact(baselineNetDollar)} net`,
            sub: 'Use for targets and spotting outliers.',
            evidence: [
              { key: 'Source', value: `Median of last ${validPrevSummaries.length} months` },
              { key: 'Use for', value: 'Targets, recurring bills, outlier detection' }
            ],
            ctas: [
              { label: 'Set target', variant: 'primary' },
              { label: 'View history', variant: 'ghost' }
            ],
            explanation: {
              calculation: `Median of ${validPrevSummaries.length} completed months.`,
              whatMatters: 'More stable than average with occasional spikes.'
            }
          })
        }

        // -----------------------------------------------------------------------
        // 3. SPENDING PATTERN (always show chart, messaging varies by data)
        // Badge: 'caution' only for high variance
        // -----------------------------------------------------------------------
        {
          const currentDailyExpenses = currentDailyFlow.map(d => d.variableExpenseDollar)
          const hasEnoughCurrentData = currentDailyFlow.length >= 7

          const prevCVs = prevDailyFlows
            .filter(flows => flows.length >= 7)
            .map(flows => coefficientOfVariation(flows.map(d => d.variableExpenseDollar)))

          const hasEnoughHistoricalData = prevCVs.length >= 2

          let body: string
          let sub: string
          let badge: 'caution' | undefined
          let evidence: { key: string; value: string }[] | undefined
          let explanation: { calculation: string; whatMatters: string }

          if (!hasEnoughCurrentData) {
            // Not enough days this month yet
            body = `${currentDailyFlow.length} days tracked`
            sub = 'Need 7+ days for pattern analysis.'
            explanation = {
              calculation: 'Daily spending variation vs typical.',
              whatMatters: 'More data needed to detect patterns.'
            }
          } else if (!hasEnoughHistoricalData) {
            // Enough current data but not enough history to compare
            body = 'Building history'
            sub = 'Need 2+ months of history.'
            explanation = {
              calculation: 'Daily spending variation vs typical.',
              whatMatters: 'More history needed to compare patterns.'
            }
          } else {
            // Full analysis possible
            const currentCV = coefficientOfVariation(currentDailyExpenses)
            const typicalCV = median(prevCVs)
            const cvDiff = currentCV - typicalCV

            const isHighVariance = cvDiff > 20
            const isLowVariance = cvDiff < -20

            if (isHighVariance) {
              body = 'More spending swings than usual'
              sub = 'Check spike days.'
              badge = 'caution'
              evidence = [
                { key: 'Signal', value: 'Daily variance above 6-month median' },
                { key: 'Cause', value: 'Spike days drove most outflow' }
              ]
              explanation = {
                calculation: 'Daily spending variation vs typical.',
                whatMatters: 'Spike days often dominate outflow.'
              }
            } else if (isLowVariance) {
              body = 'More stable than usual'
              sub = 'Predictable pattern.'
              explanation = {
                calculation: 'Daily spending variation vs typical.',
                whatMatters: 'Stable spending = predictable outcomes.'
              }
            } else {
              body = 'Normal variance'
              sub = 'Spending pattern is typical.'
              evidence = [{ key: 'Status', value: 'Within typical range' }]
              explanation = {
                calculation: 'Daily spending variation vs typical.',
                whatMatters: 'No unusual spikes or dips detected.'
              }
            }
          }

          insights.push({
            id: 'volatility',
            type: 'volatility',
            title: 'Spending pattern',
            body,
            badge,
            sub,
            evidence,
            ctas: badge === 'caution' ? [
              { label: 'Review spikes', variant: 'primary' },
              { label: 'Add note', variant: 'ghost' }
            ] : undefined,
            explanation
          })
        }

        // -----------------------------------------------------------------------
        // 4. QUIET DAYS (no badge - informational only)
        // -----------------------------------------------------------------------
        if (currentDailyFlow.length >= 7) {
          const zeroSpendDays = currentDailyFlow.filter(d => d.variableExpenseDollar === 0).length
          const lowSpendDays = currentDailyFlow.filter(d =>
            d.variableExpenseDollar > 0 && d.variableExpenseDollar <= LOW_SPEND_THRESHOLD
          ).length

          if (zeroSpendDays + lowSpendDays >= 3) {
            insights.push({
              id: 'quiet-days',
              type: 'streak',
              title: 'Quiet days',
              body: zeroSpendDays > 0
                ? `${zeroSpendDays} zero-spend + ${lowSpendDays} low-spend days`
                : `${lowSpendDays} low-spend days`,
              sub: 'Confirm empty days for accuracy.',
              evidence: [
                { key: 'Zero', value: '$0 outflow, confirmed' },
                { key: 'Low', value: `Under $${LOW_SPEND_THRESHOLD}` }
              ],
              ctas: [
                { label: 'Confirm days', variant: 'primary' },
                { label: 'Settings', variant: 'ghost' }
              ],
              explanation: {
                calculation: `Days with $0 or under $${LOW_SPEND_THRESHOLD}.`,
                whatMatters: 'Prevents missing data from inflating streaks.'
              }
            })
          }
        }

        // -----------------------------------------------------------------------
        // 5. OPPORTUNITIES (no badge - it's a suggestion, not a warning)
        // -----------------------------------------------------------------------
        if (validPrevSummaries.length >= 3 && baselineNetDollar !== null) {
          const bestNet = Math.max(...validPrevSummaries.map(s => s.netCashFlowDollar))
          // Stretch is capped to avoid whiplash (max 20% of baseline or $1000)
          const maxStretch = Math.min(Math.abs(baselineNetDollar) * 0.2, 1000)
          const rawStretch = (bestNet - baselineNetDollar) / 2
          const cappedStretch = Math.min(rawStretch, maxStretch)
          const suggestedGoal = Math.round(baselineNetDollar + cappedStretch)

          if (suggestedGoal > 0 && Math.abs(suggestedGoal - currentSummary.netCashFlowDollar) > 200) {
            insights.push({
              id: 'opportunities',
              type: 'opportunity',
              title: 'Opportunity',
              body: `Target: ${formatSignedUsdCompact(suggestedGoal)} net next month`,
              sub: 'Typical + realistic boost.',
              evidence: [
                { key: 'Breakdown', value: `Typical ${formatSignedUsdCompact(baselineNetDollar)}, boost ${formatSignedUsdCompact(Math.round(cappedStretch))}` },
                { key: 'Actions', value: 'Cut a category, shift a bill, plan big expenses' }
              ],
              ctas: [
                { label: 'Create plan', variant: 'primary' },
                { label: 'See actions', variant: 'ghost' }
              ],
              explanation: {
                calculation: 'Typical + small boost from best months.',
                whatMatters: 'Realistic target from past performance.'
              }
            })
          }
        }

        // === CHART DATA ===

        // Net trend sparkline - oldest to newest
        // prevSummaries[i] contains data for prevMonths[i]
        const netTrend: NetTrendPoint[] = []
        for (let i = prevSummaries.length - 1; i >= 0; i--) {
          const summary = prevSummaries[i]
          if (summary) {
            netTrend.push({ month: prevMonths[i], net: summary.netCashFlowDollar })
          }
        }
        netTrend.push({ month: monthYYYYMM, net: currentSummary.netCashFlowDollar })

        // Weekday spending pattern
        const weekdayTotals = new Map<number, number[]>()
        for (const day of currentDailyFlow) {
          const date = new Date(day.day + 'T00:00:00')
          const dow = date.getDay()
          const existing = weekdayTotals.get(dow) || []
          existing.push(day.expenseDollar)
          weekdayTotals.set(dow, existing)
        }
        const weekdayPattern: WeekdaySpend[] = []
        for (let d = 0; d < 7; d++) {
          const spends = weekdayTotals.get(d) || []
          const avgSpend = spends.length > 0 ? spends.reduce((a, b) => a + b, 0) / spends.length : 0
          weekdayPattern.push({ day: d, avgSpend })
        }

        // Category comparison
        const categoryComparison: CategoryComparison[] = []
        if (currentExpenseByCategory.length > 0) {
          // Build a map of category name -> color from config
          const categoryColorMap = new Map<string, string>()
          for (const cat of CATEGORIES) {
            categoryColorMap.set(cat.name, cat.color)
          }

          const currentByName = new Map<string, number>()
          for (const c of currentExpenseByCategory) {
            const name = getCategoryDisplayName(c.categoryName)
            currentByName.set(name, (currentByName.get(name) || 0) + c.totalDollar)
          }

          const lastByName = new Map<string, number>()
          for (const c of lastMonthExpenseByCategory) {
            const name = getCategoryDisplayName(c.categoryName)
            lastByName.set(name, (lastByName.get(name) || 0) + c.totalDollar)
          }

          const withChange: { name: string; thisMonth: number; lastMonth: number; absChange: number; color: string | null }[] = []
          for (const [name, thisMonth] of currentByName.entries()) {
            const lastMonth = lastByName.get(name) || 0
            const color = categoryColorMap.get(name) ?? null
            withChange.push({ name, thisMonth, lastMonth, absChange: Math.abs(thisMonth - lastMonth), color })
          }

          withChange.sort((a, b) => b.absChange - a.absChange)
          categoryComparison.push(...withChange.slice(0, 3).map(({ name, thisMonth, lastMonth, color }) => ({
            name, thisMonth, lastMonth, color
          })))
        }

        const summary: InsightsSummary = {
          pills,
          netCents: Math.round(netDollar * 100),
          baselineNetCents: baselineNetDollar !== null ? Math.round(baselineNetDollar * 100) : null,
          driverCategory,
          driverDeltaCents: driverDeltaDollar !== null ? Math.round(driverDeltaDollar * 100) : null,
          dataQuality,
          unknownDayCount
        }

        // Daily outflow for volatility chart
        const dailyOutflow: DailyOutflow[] = currentDailyFlow.map(d => ({
          day: parseInt(d.day.split('-')[2], 10),
          amount: d.variableExpenseDollar
        })).sort((a, b) => a.day - b.day)

        setData({
          summary,
          insights,
          categoryComparison,
          netTrend,
          weekdayPattern,
          dailyOutflow,
          medianNet: baselineNetDollar,
          monthYYYYMM,
          hasEnoughData: hasData
        })
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Unknown error')
        setData(DEFAULT_DATA)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    run()
    return () => {
      alive = false
    }
  }, [monthYYYYMM])

  return { loading, error, data }
}
