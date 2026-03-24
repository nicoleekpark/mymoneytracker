import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  getItemPriceSummariesDollar,
  getStores,
  type ItemPriceSummaryDollar,
  type Store,
} from '@/domain/price-tracker'

/**
 * Main data hook for price tracker screen.
 */
export function usePriceTracker() {
  const [items, setItems] = useState<ItemPriceSummaryDollar[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    setIsLoading(true)
    try {
      const itemSummaries = getItemPriceSummariesDollar(50)
      const allStores = getStores()
      setItems(itemSummaries)
      setStores(allStores)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh])
  )

  return {
    items,
    stores,
    isLoading,
    refresh,
  }
}
