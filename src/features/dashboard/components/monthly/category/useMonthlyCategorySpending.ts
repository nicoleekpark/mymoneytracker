import type { CategoryRef } from '@/domain/category'
import { resolveCategoryRefFromDbId } from '@/domain/category/category.repo'
import type { UUID } from '@/domain/common/uuid'
import {
  getMonthlyExpenseByCategoryDollar,
  getMonthlySummaryDollar
} from '@/domain/transaction/transaction.usecase'
import { useEffect, useState } from 'react'

export type CategorySpendingRow = Readonly<{
  categoryId: UUID | null
  categoryRef?: CategoryRef
  totalDollar: number
}>

export function useMonthlyCategorySpending(monthYYYYMM: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalSpentDollar, setTotalSpentDollar] = useState(0)
  const [rows, setRows] = useState<CategorySpendingRow[]>([])

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const [summary, byCat] = await Promise.all([
          getMonthlySummaryDollar(monthYYYYMM),
          getMonthlyExpenseByCategoryDollar(monthYYYYMM)
        ])

        if (!alive) return

        setTotalSpentDollar(Number(summary?.expenseTotalDollar ?? 0))

        const normalized: CategorySpendingRow[] = (Array.isArray(byCat) ? byCat : []).map((r: any) => {
          const categoryId = (r?.categoryId ?? null) as UUID | null
          const totalDollar = Number(r?.totalDollar ?? 0)

          const categoryRef =
            categoryId ? resolveCategoryRefFromDbId(categoryId) : undefined

          return { categoryId, categoryRef, totalDollar }
        })

        setRows(normalized)
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Unknown error')
        setTotalSpentDollar(0)
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
  }, [monthYYYYMM])

  return { loading, error, totalSpentDollar, rows }
}
