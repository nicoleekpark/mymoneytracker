import AddTransactionScreen from '@/features/transactions/add/AddTransactionScreen'
import { FeatureErrorBoundary } from '@/shared/components'

export default function AddTransactionModalRoute() {
  return (
    <FeatureErrorBoundary featureName="Add Transaction">
      <AddTransactionScreen />
    </FeatureErrorBoundary>
  )
}
