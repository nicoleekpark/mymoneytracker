import { AccountSelectionScreen } from '@/features/transactions/add/screens/AccountSelectionScreen'
import { FeatureErrorBoundary } from '@/shared/components'

export default function AccountSelectionRoute() {
  return (
    <FeatureErrorBoundary featureName="Account Selection">
      <AccountSelectionScreen />
    </FeatureErrorBoundary>
  )
}
