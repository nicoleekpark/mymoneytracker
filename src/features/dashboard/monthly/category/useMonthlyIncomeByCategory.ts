import { UNCATEGORIZED_KEY, type CategoryRef } from '@/core/domain/category'
import type { UUID } from '@/core/domain/common/uuid'
import { getCategoryRefByDbId } from '@/core/services/category'
import {
  getMonthlyIncomeByCategoryDollar,
  getMonthlySummaryDollar
} from '@/core/services/transaction'
import { useDataRefreshStore } from '@/shared/store'
import { useEffect, useState } from 'react'

export type SubCategoryBreakdown = Readonly<{
  subCategoryKey: string
  totalDollar: number
}>

export type IncomeSpendingRow = Readonly<{
  categoryId: UUID | null
  categoryRef?: CategoryRef
  totalDollar: number
  subcategories: SubCategoryBreakdown[]
}>

/**
 * Aggregate category data by parent categoryKey.
 * Combines subcategories under their parent category and tracks subcategory breakdown.
 */
function aggregateByParentCategory(
  rawData: Array<{ categoryId: UUID | null; totalDollar: number }>
): IncomeSpendingRow[] {
  const byKey = new Map<
    string,
    {
      totalDollar: number
      categoryRef: CategoryRef
      subcategories: Map<string, number>
    }
  >()

  for (const row of rawData) {
    if (!row.categoryId) {
      // Handle uncategorized
      const existing = byKey.get('__uncategorized__')
      if (existing) {
        existing.totalDollar += row.totalDollar
      } else {
        byKey.set('__uncategorized__', {
          totalDollar: row.totalDollar,
          categoryRef: { type: 'income', categoryKey: UNCATEGORIZED_KEY },
          subcategories: new Map()
        })
      }
      continue
    }

    const ref = getCategoryRefByDbId(row.categoryId)
    if (!ref) continue // Skip orphaned transactions with deleted categories

    const parentKey = ref.categoryKey
    const subKey = ref.subCategoryKey

    const existing = byKey.get(parentKey)
    if (existing) {
      existing.totalDollar += row.totalDollar
      // Track subcategory if present
      if (subKey) {
        const currentSubTotal = existing.subcategories.get(subKey) ?? 0
        existing.subcategories.set(subKey, currentSubTotal + row.totalDollar)
      }
    } else {
      const subcategories = new Map<string, number>()
      if (subKey) {
        subcategories.set(subKey, row.totalDollar)
      }
      byKey.set(parentKey, {
        totalDollar: row.totalDollar,
        categoryRef: { type: ref.type, categoryKey: ref.categoryKey },
        subcategories
      })
    }
  }

  return Array.from(byKey.entries())
    .map(([_key, data]) => ({
      categoryId: null,
      categoryRef: data.categoryRef,
      totalDollar: data.totalDollar,
      subcategories: Array.from(data.subcategories.entries())
        .map(([subCategoryKey, totalDollar]) => ({ subCategoryKey, totalDollar }))
        .sort((a, b) => b.totalDollar - a.totalDollar)
    }))
    .sort((a, b) => b.totalDollar - a.totalDollar)
}

export function useMonthlyIncomeByCategory(monthYYYYMM: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalIncomeDollar, setTotalIncomeDollar] = useState(0)
  const [rows, setRows] = useState<IncomeSpendingRow[]>([])

  // Subscribe to transaction changes to auto-refresh
  const transactionVersion = useDataRefreshStore((s) => s.transactionVersion)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const [summary, byCat] = await Promise.all([
          getMonthlySummaryDollar(monthYYYYMM),
          getMonthlyIncomeByCategoryDollar(monthYYYYMM)
        ])

        if (!alive) return

        setTotalIncomeDollar(Number(summary?.incomeTotalDollar ?? 0))

        // Aggregate by parent category to avoid duplicates
        const aggregated = aggregateByParentCategory(
          (Array.isArray(byCat) ? byCat : []).map((r: any) => ({
            categoryId: (r?.categoryId ?? null) as UUID | null,
            totalDollar: Number(r?.totalDollar ?? 0)
          }))
        )

        setRows(aggregated)
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Unknown error')
        setTotalIncomeDollar(0)
        setRows([])
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    run()
    return () => {
      alive = false
    }
  }, [monthYYYYMM, transactionVersion])

  return { loading, error, totalIncomeDollar, rows }
}
