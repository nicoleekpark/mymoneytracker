import { useCallback, useState } from 'react'

import type { Transaction } from '@/domain/transaction'
import { getTransactionsInRange } from '@/domain/transaction'
import { useAsyncDataWithDefault } from '@/shared/hooks'

export type TransactionsPageData = Readonly<{
  items: Transaction[]
  hasMore: boolean
  oldestDate: string | null
}>

const DEFAULT_DATA: TransactionsPageData = {
  items: [],
  hasMore: false,
  oldestDate: null,
}

/**
 * Hook for paginated transaction list.
 * Default: loads 1 year of transactions.
 * Supports "Load more" to fetch older transactions.
 */
export function useTransactionsData() {
  const [loadMoreCount, setLoadMoreCount] = useState(0)

  const fetchData = useCallback(async (): Promise<TransactionsPageData> => {
    // Each "load more" extends the window by 1 year
    const now = new Date()
    const yearsBack = 1 + loadMoreCount
    const fromDate = new Date(now.getFullYear() - yearsBack, now.getMonth(), now.getDate())

    const page = await getTransactionsInRange(fromDate, now)

    return {
      items: page.items,
      hasMore: page.hasMore,
      oldestDate: page.oldestDate,
    }
  }, [loadMoreCount])

  const result = useAsyncDataWithDefault(
    fetchData,
    [loadMoreCount],
    { defaultValue: DEFAULT_DATA }
  )

  const loadMore = useCallback(() => {
    if (result.data.hasMore) {
      setLoadMoreCount((c) => c + 1)
    }
  }, [result.data.hasMore])

  return {
    ...result,
    loadMore,
    isLoadingMore: loadMoreCount > 0 && result.loading,
  }
}
