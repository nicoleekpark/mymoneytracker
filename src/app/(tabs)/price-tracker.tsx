import { PriceTrackerScreen } from '@/features/price-tracker'
import { FeatureErrorBoundary } from '@/shared/components'

export default function PriceTrackerRoute() {
  return (
    <FeatureErrorBoundary featureName="Price Tracker">
      <PriceTrackerScreen />
    </FeatureErrorBoundary>
  )
}
