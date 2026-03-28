import { useCallback, useEffect, useState } from 'react'
import { searchItems } from '@/core/services/price-tracker'
import type { TrackedItem } from '@/core/domain/price-tracker'

/**
 * Debounced search hook for tracked items.
 */
export function useItemSearch(debounceMs = 200) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TrackedItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      const items = searchItems(trimmed, 10)
      setResults(items)
      setIsSearching(false)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  const clear = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  return {
    query,
    setQuery,
    results,
    isSearching,
    clear,
  }
}
