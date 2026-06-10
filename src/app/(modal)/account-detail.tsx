import { AccountDetailScreen } from '@/features/accounts/detail'
import { FeatureErrorBoundary } from '@/shared/components'

export default function AccountDetailModalRoute() {
  return (
    <FeatureErrorBoundary featureName="Account Detail">
      <AccountDetailScreen />
    </FeatureErrorBoundary>
  )
}
