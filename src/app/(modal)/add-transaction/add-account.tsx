import AddAccountScreen from '@/features/accounts/add/AddAccountScreen'
import { FeatureErrorBoundary } from '@/shared/components'

export default function AddAccountInTransactionRoute() {
  return (
    <FeatureErrorBoundary featureName="Add Account">
      <AddAccountScreen />
    </FeatureErrorBoundary>
  )
}
