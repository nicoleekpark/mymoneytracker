import AddTransactionScreen from '@/features/transactions/add/AddTransactionScreen'
import { FeatureErrorBoundary } from '@/shared/components'

export default function EditTransactionModalRoute() {
  return (
    <FeatureErrorBoundary featureName="Edit Transaction">
      <AddTransactionScreen mode="edit" />
    </FeatureErrorBoundary>
  )
}
