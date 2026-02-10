import { useEffect, useState } from 'react'

import { CATEGORIES, FIXED_CATEGORY_KEYS } from '@/config/categories.config'
import {
  getMonthlySummaryDollar,
  getMonthlyExpenseByCategoryDollar,
  getPersonalBests,
  getDailyFlowDollarForMonth,
  type MonthlySummaryDollar,
  type DailyFlowDollar
} from '@/domain/transaction/transaction.usecase'
import { formatSignedUsdInt } from '@/shared/format/currency'

import type { InsightsData, InsightCardData, NetTrendPoint, WeekdaySpend, CategoryComparison } from '../insights.types'

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

// Get category name from category ID
function getCategoryName(categoryId: string | null): string {
  if (!categoryId) return 'Uncategorized'
  const cat = CATEGORIES.find(c => c.key === categoryId)
  return cat?.name || 'Other'
}

// Calculate median
function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
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

const DEFAULT_DATA: InsightsData = {
  thisMonth: {
    changeVsLastMonth: null,
    primaryDriver: null,
    categoryComparison: []
  },
  patterns: {
    netBaseline: null,
    volatilityCheck: null,
    positiveStreak: null,
    quietDays: null,
    netTrend: [],
    weekdayPattern: [],
    medianNet: null
  },
  watchouts: [],
  opportunities: [],
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
        // Get previous 6 months for baseline calculation
        const prevMonths = getPrevMonths(monthYYYYMM, 6)
        const lastMonthYYYYMM = prevMonths[0]

        // Fetch all data in parallel
        const [
          currentSummary,
          lastMonthSummary,
          currentExpenseByCategory,
          lastMonthExpenseByCategory,
          personalBests,
          currentDailyFlow,
          ...prevMonthsData
        ] = await Promise.all([
          getMonthlySummaryDollar(monthYYYYMM),
          getMonthlySummaryDollar(lastMonthYYYYMM).catch(() => null),
          getMonthlyExpenseByCategoryDollar(monthYYYYMM),
          getMonthlyExpenseByCategoryDollar(lastMonthYYYYMM).catch(() => []),
          getPersonalBests(),
          getDailyFlowDollarForMonth(monthYYYYMM),
          // Fetch summary, daily flow, and category expenses for previous months
          ...prevMonths.slice(0, 5).flatMap(m => [
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

        // Check if we have enough data (at least 2 months)
        const hasData = currentSummary.incomeTotalDollar > 0 || currentSummary.expenseTotalDollar > 0
        const hasLastMonth = lastMonthSummary !== null &&
          (lastMonthSummary.incomeTotalDollar > 0 || lastMonthSummary.expenseTotalDollar > 0)

        // === THIS MONTH: Change vs last month ===
        let changeVsLastMonth: InsightCardData | null = null
        if (hasLastMonth && lastMonthSummary) {
          const netChange = currentSummary.netCashFlowDollar - lastMonthSummary.netCashFlowDollar

          // Find primary driver (biggest category change)
          let driverText = ''
          if (currentExpenseByCategory.length > 0 && lastMonthExpenseByCategory.length > 0) {
            const currentByKey = new Map(currentExpenseByCategory.map(c => [c.categoryId, c.totalDollar]))
            const lastByKey = new Map(lastMonthExpenseByCategory.map(c => [c.categoryId, c.totalDollar]))

            let maxChange = 0
            let maxChangeCategory = ''

            // Check all categories from both months
            const allCategories = new Set([...currentByKey.keys(), ...lastByKey.keys()])
            for (const catId of allCategories) {
              const curr = currentByKey.get(catId) || 0
              const last = lastByKey.get(catId) || 0
              const change = Math.abs(curr - last)
              if (change > maxChange) {
                maxChange = change
                maxChangeCategory = getCategoryName(catId)
              }
            }

            if (maxChangeCategory && maxChange > 50) {
              const expenseChange = (currentByKey.get(
                [...allCategories].find(k => getCategoryName(k) === maxChangeCategory) || null
              ) || 0) - (lastByKey.get(
                [...allCategories].find(k => getCategoryName(k) === maxChangeCategory) || null
              ) || 0)
              const changeDirection = expenseChange > 0 ? 'higher' : 'lower'
              driverText = `, mainly from ${changeDirection} ${maxChangeCategory.toLowerCase()} spend`
            }
          }

          changeVsLastMonth = {
            id: 'change-vs-last',
            type: 'change',
            title: 'Change vs last month',
            body: `Net changed by ${formatSignedUsdInt(netChange)}${driverText}`,
            explanation: {
              calculation: 'Compares this month\'s net (income - expense) to last month.',
              whatMatters: 'Shows whether you\'re trending up or down month over month.'
            }
          }
        }

        // === THIS MONTH: Primary driver ===
        let primaryDriver: InsightCardData | null = null
        if (hasData) {
          // Find biggest expense category this month
          if (currentExpenseByCategory.length > 0) {
            const sorted = [...currentExpenseByCategory].sort((a, b) => b.totalDollar - a.totalDollar)
            const top = sorted[0]
            const topName = getCategoryName(top.categoryId)
            const topPercent = currentSummary.expenseTotalDollar > 0
              ? Math.round((top.totalDollar / currentSummary.expenseTotalDollar) * 100)
              : 0

            if (topPercent >= 30) {
              primaryDriver = {
                id: 'primary-driver',
                type: 'driver',
                title: 'Primary driver',
                body: `${topName} accounts for ${topPercent}% of spending`,
                explanation: {
                  calculation: 'Identifies your largest expense category this month.',
                  whatMatters: 'Knowing where most money goes helps prioritize adjustments.'
                }
              }
            } else {
              primaryDriver = {
                id: 'primary-driver',
                type: 'driver',
                title: 'Primary driver',
                body: 'Spending is spread across multiple categories',
                explanation: {
                  calculation: 'Checks if any single category dominates your spending.',
                  whatMatters: 'Diversified spending means no single category is driving outcomes.'
                }
              }
            }
          }
        }

        // === PATTERNS: Net baseline ===
        let netBaseline: InsightCardData | null = null
        const validPrevSummaries = [lastMonthSummary, ...prevSummaries]
          .filter((s): s is MonthlySummaryDollar => s !== null)
        if (validPrevSummaries.length >= 3) {
          const prevNets = validPrevSummaries.map(s => s.netCashFlowDollar)
          const medianNet = median(prevNets)

          netBaseline = {
            id: 'net-baseline',
            type: 'baseline',
            title: 'Net baseline',
            body: `Your typical month ends around ${formatSignedUsdInt(medianNet)} net`,
            explanation: {
              calculation: `Median net over the last ${validPrevSummaries.length} months.`,
              whatMatters: 'Helps you understand what\'s normal for you.'
            }
          }
        }

        // === PATTERNS: Volatility check ===
        let volatilityCheck: InsightCardData | null = null
        if (currentDailyFlow.length >= 7) {
          // Get daily variable expenses for this month
          const currentDailyExpenses = currentDailyFlow.map(d => d.variableExpenseDollar)
          const currentCV = coefficientOfVariation(currentDailyExpenses)

          // Calculate typical CV from previous months
          const prevCVs = prevDailyFlows
            .filter(flows => flows.length >= 7)
            .map(flows => coefficientOfVariation(flows.map(d => d.variableExpenseDollar)))

          if (prevCVs.length >= 2) {
            const typicalCV = median(prevCVs)
            const cvDiff = currentCV - typicalCV

            // Only show if there's a meaningful difference (>20% change in volatility)
            if (Math.abs(cvDiff) > 20) {
              const isMoreStable = cvDiff < 0
              volatilityCheck = {
                id: 'volatility-check',
                type: 'volatility',
                title: 'Volatility check',
                body: isMoreStable
                  ? 'This month was more stable than usual'
                  : 'This month had more spending swings than usual',
                explanation: {
                  calculation: 'Compares day-to-day spending variation this month vs your typical pattern.',
                  whatMatters: isMoreStable
                    ? 'Stable spending often means predictable outcomes.'
                    : 'Higher volatility can make budgeting harder to track.'
                }
              }
            }
          }
        }

        // === PATTERNS: Positive streak ===
        let positiveStreak: InsightCardData | null = null
        if (personalBests.currentStreak.months > 0) {
          const { months, isPositive } = personalBests.currentStreak
          if (isPositive && months >= 2) {
            positiveStreak = {
              id: 'positive-streak',
              type: 'streak',
              title: 'Positive streak',
              body: `${months} months in a row with positive net`,
              explanation: {
                calculation: 'Counts consecutive months where income exceeded expenses.',
                whatMatters: 'Consistency matters more than any single month.'
              }
            }
          } else if (!isPositive && months >= 2) {
            positiveStreak = {
              id: 'negative-streak',
              type: 'streak',
              title: 'Current streak',
              body: `${months} months with negative net`,
              explanation: {
                calculation: 'Counts consecutive months where expenses exceeded income.',
                whatMatters: 'Identifies patterns that may need attention.'
              }
            }
          }
        }

        // === PATTERNS: Quiet days ===
        let quietDays: InsightCardData | null = null
        if (currentDailyFlow.length >= 7) {
          // Count days with zero or very low variable spending
          const zeroSpendDays = currentDailyFlow.filter(d => d.variableExpenseDollar === 0).length
          const lowSpendDays = currentDailyFlow.filter(d =>
            d.variableExpenseDollar > 0 && d.variableExpenseDollar <= LOW_SPEND_THRESHOLD
          ).length
          const quietDaysCount = zeroSpendDays + lowSpendDays

          // Only show if there are meaningful quiet days (at least 3)
          if (quietDaysCount >= 3) {
            quietDays = {
              id: 'quiet-days',
              type: 'streak',
              title: 'Quiet days',
              body: zeroSpendDays > 0
                ? `${zeroSpendDays} zero-spend days and ${lowSpendDays} low-spend days this month`
                : `${lowSpendDays} low-spend days this month`,
              explanation: {
                calculation: `Counts days with no variable spending or under $${LOW_SPEND_THRESHOLD}.`,
                whatMatters: 'Quiet days help balance out higher-spend days.'
              }
            }
          }
        }

        // === WATCHOUTS ===
        const watchouts: InsightCardData[] = []

        // Category drift: detect categories steadily increasing over 3+ months
        if (currentExpenseByCategory.length > 0 && prevCategoryExpenses.length >= 2) {
          // Build category history: [currentMonth, lastMonth, month-2, ...]
          const allCategoryData = [
            currentExpenseByCategory,
            lastMonthExpenseByCategory,
            ...prevCategoryExpenses.slice(0, 2) // Look at 3-4 months total
          ].filter(arr => arr.length > 0)

          if (allCategoryData.length >= 3) {
            // Track each category's trend
            const categoryTrends = new Map<string, number[]>()

            for (const monthData of allCategoryData) {
              for (const cat of monthData) {
                const catName = getCategoryName(cat.categoryId)
                const existing = categoryTrends.get(catName) || []
                existing.push(cat.totalDollar)
                categoryTrends.set(catName, existing)
              }
            }

            // Find categories with consistent upward trend
            for (const [catName, values] of categoryTrends.entries()) {
              if (values.length < 3) continue
              // Check if each month is higher than the previous (trending up)
              let isIncreasing = true
              for (let i = 0; i < values.length - 1; i++) {
                // values[0] is current month, values[1] is last month, etc.
                // So we check if current > last > month-2 (values should decrease as index increases)
                if (values[i] <= values[i + 1]) {
                  isIncreasing = false
                  break
                }
              }

              if (isIncreasing) {
                const totalIncrease = values[0] - values[values.length - 1]
                // Only show if increase is meaningful (> $30 over the period)
                // Only add one drift card per category name (first one wins)
                const alreadyHasDrift = watchouts.some(w => w.id.startsWith('drift-') && w.body.includes(catName))
                if (totalIncrease > 30 && !alreadyHasDrift) {
                  watchouts.push({
                    id: `drift-${catName.toLowerCase().replace(/\s+/g, '-')}-${watchouts.length}`,
                    type: 'watchout',
                    title: 'Category drift',
                    body: `${catName} has been steadily increasing`,
                    explanation: {
                      calculation: `Compares ${catName.toLowerCase()} spending over the last ${values.length} months.`,
                      whatMatters: 'Gradual increases can add up over time.'
                    }
                  })
                }
              }
            }
          }
        }

        // Spending spike: category significantly higher than baseline
        // Track which categories we've already added spikes for
        const spikeAddedFor = new Set<string>()
        if (currentExpenseByCategory.length > 0 && prevCategoryExpenses.length >= 2) {
          const categoryBaselines = new Map<string, number>()

          // Calculate median for each category from previous months
          for (const cat of currentExpenseByCategory) {
            const catName = getCategoryName(cat.categoryId)
            const prevValues = [lastMonthExpenseByCategory, ...prevCategoryExpenses]
              .flat()
              .filter(c => getCategoryName(c.categoryId) === catName)
              .map(c => c.totalDollar)

            if (prevValues.length >= 2) {
              categoryBaselines.set(catName, median(prevValues))
            }
          }

          // Check if any category is 30%+ above its baseline
          for (const cat of currentExpenseByCategory) {
            const catName = getCategoryName(cat.categoryId)
            // Skip Other/Uncategorized
            if (catName === 'Other' || catName === 'Uncategorized') continue

            const baseline = categoryBaselines.get(catName)

            if (baseline && baseline > 30) { // Only for categories with meaningful baseline
              const diff = cat.totalDollar - baseline
              const percentAbove = (diff / baseline) * 100
              if (percentAbove >= 30 && diff > 50) {
                // Don't add spike if we already have drift for same category or already added spike
                const hasDrift = watchouts.some(w => w.id.startsWith('drift-') && w.body.includes(catName))
                if (!hasDrift && !spikeAddedFor.has(catName)) {
                  spikeAddedFor.add(catName)
                  watchouts.push({
                    id: `spike-${catName.toLowerCase().replace(/\s+/g, '-')}-${watchouts.length}`,
                    type: 'watchout',
                    title: 'Spending spike',
                    body: `${catName} is ${formatSignedUsdInt(diff)} above your typical spend`,
                    explanation: {
                      calculation: `This month: ${formatSignedUsdInt(cat.totalDollar).replace('+', '')} vs typical: ${formatSignedUsdInt(baseline).replace('+', '')}.`,
                      whatMatters: 'One-time spikes might be planned, or worth a second look.'
                    }
                  })
                }
              }
            }
          }
        }

        // End-of-month timing: check if spending is concentrated in last week
        if (currentDailyFlow.length >= 14) {
          const lastWeekDays = currentDailyFlow.slice(-7)
          const lastWeekSpend = lastWeekDays.reduce((sum, d) => sum + d.expenseDollar, 0)
          const totalSpend = currentDailyFlow.reduce((sum, d) => sum + d.expenseDollar, 0)

          if (totalSpend > 0) {
            const lastWeekPercent = (lastWeekSpend / totalSpend) * 100
            // If last week accounts for > 35% of monthly spend, flag it
            if (lastWeekPercent > 35) {
              watchouts.push({
                id: 'timing-mismatch',
                type: 'watchout',
                title: 'End-of-month surge',
                body: 'Most spending happened in the last week',
                explanation: {
                  calculation: 'Compares spending in the last 7 days vs the rest of the month.',
                  whatMatters: 'Late-month spending can sometimes carry into next month\'s budget.'
                }
              })
            }
          }
        }

        // === OPPORTUNITIES ===
        const opportunities: InsightCardData[] = []

        // Low-effort win: Find the largest variable expense category
        if (currentExpenseByCategory.length > 0) {
          // Filter to variable expense categories only, exclude Other/Uncategorized
          const variableCategories = currentExpenseByCategory.filter(cat => {
            const catKey = cat.categoryId
            const catName = getCategoryName(catKey)
            return catKey &&
              !FIXED_CATEGORY_KEYS.includes(catKey) &&
              catName !== 'Other' &&
              catName !== 'Uncategorized'
          })

          if (variableCategories.length > 0) {
            // Sort by amount descending
            const sorted = [...variableCategories].sort((a, b) => b.totalDollar - a.totalDollar)
            const top = sorted[0]
            const topName = getCategoryName(top.categoryId)

            // Only show if it's a meaningful amount (> $100)
            if (top.totalDollar > 100) {
              opportunities.push({
                id: 'low-effort-win',
                type: 'opportunity',
                title: 'Low-effort win',
                body: `${topName} at ${formatSignedUsdInt(top.totalDollar).replace('+', '')} has the most room to adjust`,
                explanation: {
                  calculation: 'Identifies your largest variable expense category.',
                  whatMatters: 'Variable expenses are easier to adjust than fixed costs.'
                }
              })
            }
          }
        }

        // Soft goal: Suggest a realistic target based on baseline
        if (validPrevSummaries.length >= 3) {
          const prevNets = validPrevSummaries.map(s => s.netCashFlowDollar)
          const medianNet = median(prevNets)
          const bestNet = Math.max(...prevNets)

          // Suggest a goal between median and best (achievable stretch)
          const suggestedGoal = Math.round((medianNet + bestNet) / 2)

          // Only show if goal is positive and meaningfully different from current
          if (suggestedGoal > 0 && Math.abs(suggestedGoal - currentSummary.netCashFlowDollar) > 200) {
            opportunities.push({
              id: 'soft-goal',
              type: 'opportunity',
              title: 'Soft goal',
              body: `Aim for ${formatSignedUsdInt(suggestedGoal)} net next month`,
              explanation: {
                calculation: 'Based on your median and best months over the last 6 months.',
                whatMatters: 'A realistic stretch goal based on what you\'ve achieved before.'
              }
            })
          }
        }

        // === CHART DATA ===

        // Net trend sparkline data (current + previous months)
        const netTrend: NetTrendPoint[] = []
        // Add previous months in chronological order (oldest first)
        const allSummaries = [...prevSummaries].reverse()
        allSummaries.forEach((summary, i) => {
          if (summary) {
            const monthIdx = prevMonths.length - 1 - i
            if (monthIdx >= 0 && monthIdx < prevMonths.length) {
              netTrend.push({
                month: prevMonths[monthIdx],
                net: summary.netCashFlowDollar
              })
            }
          }
        })
        // Add last month
        if (lastMonthSummary) {
          netTrend.push({
            month: lastMonthYYYYMM,
            net: lastMonthSummary.netCashFlowDollar
          })
        }
        // Add current month
        netTrend.push({
          month: monthYYYYMM,
          net: currentSummary.netCashFlowDollar
        })

        // Weekday spending pattern
        const weekdayTotals = new Map<number, number[]>()
        for (const day of currentDailyFlow) {
          // Parse day string to get day of week (YYYY-MM-DD)
          const date = new Date(day.day + 'T00:00:00')
          const dow = date.getDay() // 0 = Sun, 6 = Sat
          const existing = weekdayTotals.get(dow) || []
          existing.push(day.expenseDollar)
          weekdayTotals.set(dow, existing)
        }
        const weekdayPattern: WeekdaySpend[] = []
        for (let d = 0; d < 7; d++) {
          const spends = weekdayTotals.get(d) || []
          const avgSpend = spends.length > 0
            ? spends.reduce((a, b) => a + b, 0) / spends.length
            : 0
          weekdayPattern.push({ day: d, avgSpend })
        }

        // Category comparison (this month vs last month)
        // Aggregate by category name first (combines multiple "Other" entries)
        const categoryComparison: CategoryComparison[] = []
        if (currentExpenseByCategory.length > 0) {
          // Aggregate current month by name
          const currentByName = new Map<string, number>()
          for (const c of currentExpenseByCategory) {
            const name = getCategoryName(c.categoryId)
            currentByName.set(name, (currentByName.get(name) || 0) + c.totalDollar)
          }

          // Aggregate last month by name
          const lastByName = new Map<string, number>()
          for (const c of lastMonthExpenseByCategory) {
            const name = getCategoryName(c.categoryId)
            lastByName.set(name, (lastByName.get(name) || 0) + c.totalDollar)
          }

          // Calculate changes (exclude "Other" and "Uncategorized" for cleaner display)
          const withChange: { name: string; thisMonth: number; lastMonth: number; absChange: number }[] = []
          for (const [name, thisMonth] of currentByName.entries()) {
            if (name === 'Other' || name === 'Uncategorized') continue
            const lastMonth = lastByName.get(name) || 0
            withChange.push({
              name,
              thisMonth,
              lastMonth,
              absChange: Math.abs(thisMonth - lastMonth)
            })
          }

          withChange.sort((a, b) => b.absChange - a.absChange)
          categoryComparison.push(...withChange.slice(0, 3).map(({ name, thisMonth, lastMonth }) => ({
            name,
            thisMonth,
            lastMonth
          })))
        }

        // Median net for baseline
        const medianNetValue = validPrevSummaries.length >= 3
          ? median(validPrevSummaries.map(s => s.netCashFlowDollar))
          : null

        setData({
          thisMonth: {
            changeVsLastMonth,
            primaryDriver,
            categoryComparison
          },
          patterns: {
            netBaseline,
            volatilityCheck,
            positiveStreak,
            quietDays,
            netTrend,
            weekdayPattern,
            medianNet: medianNetValue
          },
          watchouts,
          opportunities,
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
