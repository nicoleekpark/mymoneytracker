import { useCallback, useEffect, useState } from 'react'

export type AsyncDataState<T> = Readonly<{
  loading: boolean
  error: string | null
  data: T | null
  refetch: () => void
}>

/**
 * Generic hook for fetching async data with proper cleanup handling.
 * Eliminates duplicated async fetch patterns across components.
 *
 * @param fetcher - Async function that returns the data
 * @param deps - Dependency array for re-fetching (similar to useEffect deps)
 * @param options - Optional configuration
 * @returns Loading/error/data state plus a refetch function
 *
 * @example
 * ```tsx
 * const { loading, error, data } = useAsyncData(
 *   () => getMonthlySummaryDollar(month),
 *   [month]
 * )
 * ```
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  options?: {
    /** Initial data value while loading */
    initialData?: T
    /** Skip fetching when true */
    skip?: boolean
  }
): AsyncDataState<T> {
  const { initialData = null, skip = false } = options ?? {}

  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(initialData)
  const [fetchCount, setFetchCount] = useState(0)

  const refetch = useCallback(() => {
    setFetchCount((c) => c + 1)
  }, [])

  useEffect(() => {
    if (skip) {
      setLoading(false)
      setData(initialData)
      setError(null)
      return
    }

    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const result = await fetcher()

        if (!alive) return

        setData(result)
      } catch (e) {
        if (!alive) return

        setError(e instanceof Error ? e.message : 'Unknown error')
        setData(null)
      } finally {
        if (!alive) return

        setLoading(false)
      }
    }

    run()

    return () => {
      alive = false
    }
  }, [...deps, fetchCount, skip])

  return { loading, error, data, refetch }
}

/**
 * Variant that accepts a fetcher that may return null/undefined.
 * Returns a non-null default when skipped or on error.
 *
 * @example
 * ```tsx
 * const { loading, error, data } = useAsyncDataWithDefault(
 *   () => getMonthlyData(month),
 *   [month],
 *   { defaultValue: [] }
 * )
 * // data is always T, never null
 * ```
 */
export function useAsyncDataWithDefault<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  options: {
    defaultValue: T
    skip?: boolean
  }
): Omit<AsyncDataState<T>, 'data'> & { data: T } {
  const { defaultValue, skip = false } = options

  const result = useAsyncData(fetcher, deps, {
    initialData: defaultValue,
    skip,
  })

  return {
    ...result,
    data: result.data ?? defaultValue,
  }
}
