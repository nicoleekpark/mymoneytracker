// ═══════════════════════════════════════════════════════════════════════════
// DATA FETCHING HOOK: Monthly Summary
// Pattern: Custom hook that fetches data and returns { loading, error, data }
// ═══════════════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react'
import { getMonthlySummaryDollar, type MonthlySummaryDollar } from '@/core/services/transaction'
import { useDataRefreshStore } from '@/shared/store'

// Default/empty state (returned while loading or on error)
const DEFAULT_DATA: MonthlySummaryDollar = {
  month: '',
  expenseTotalDollar: 0,
  incomeTotalDollar: 0,
  netCashFlowDollar: 0,
}

/**
 * Hook to fetch monthly summary data.
 * @param monthYYYYMM - Month in "YYYY-MM" format (e.g., "2024-03")
 * @returns { loading, error, data }
 */
export function useMonthlySummary(monthYYYYMM: string) {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MonthlySummaryDollar>(DEFAULT_DATA)

  // Subscribe to transaction changes to auto-refresh
  const transactionVersion = useDataRefreshStore((s) => s.transactionVersion)

  // ─── Effect: Fetch Data When Month Changes ─────────────────────────────────
  useEffect(() => {
    let alive = true  // Flag to prevent state updates after unmount

    async function run() {
      setLoading(true)
      setError(null)

      try {
        // Call domain use-case (which calls repository → database)
        const summary = await getMonthlySummaryDollar(monthYYYYMM)

        if (!alive) return  // Component unmounted, don't update state
        setData(summary)
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

    // Cleanup: mark as unmounted to prevent state updates
    return () => {
      alive = false
    }
  }, [monthYYYYMM, transactionVersion])  // Re-run when month or data changes

  return { loading, error, data }
}
