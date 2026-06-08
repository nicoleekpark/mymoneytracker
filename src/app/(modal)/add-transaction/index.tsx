import AddTransactionScreen from '@/features/transactions/add/AddTransactionScreen'
import { FeatureErrorBoundary } from '@/shared/components'

export default function AddTransactionIndexRoute() {
  return (
    <FeatureErrorBoundary featureName="Add Transaction">
      <AddTransactionScreen />
    </FeatureErrorBoundary>
  )
}
