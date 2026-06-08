import { CategorySelectionScreen } from '@/features/transactions/add/screens/CategorySelectionScreen'
import { FeatureErrorBoundary } from '@/shared/components'

export default function CategorySelectionRoute() {
  return (
    <FeatureErrorBoundary featureName="Category Selection">
      <CategorySelectionScreen />
    </FeatureErrorBoundary>
  )
}
