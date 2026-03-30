import { NotificationsScreen } from '@/features/notifications'
import { FeatureErrorBoundary } from '@/shared/components'

export default function NotificationsRoute() {
  return (
    <FeatureErrorBoundary featureName="Notifications">
      <NotificationsScreen />
    </FeatureErrorBoundary>
  )
}
