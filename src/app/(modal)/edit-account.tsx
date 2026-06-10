import { EditAccountScreen } from '@/features/accounts/edit'
import { FeatureErrorBoundary } from '@/shared/components'

export default function EditAccountModalRoute() {
  return (
    <FeatureErrorBoundary featureName="Edit Account">
      <EditAccountScreen />
    </FeatureErrorBoundary>
  )
}
