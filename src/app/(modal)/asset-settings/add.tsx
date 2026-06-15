/**
 * Add Asset Screen (within asset-settings stack)
 *
 * Slides from right within the asset-settings modal.
 * Can be accessed directly via router.push('/(modal)/asset-settings/add')
 * which opens the modal and navigates to this screen.
 */

import { AddAssetScreen } from '@/features/assets/add'
import { FeatureErrorBoundary } from '@/shared/components'

export default function AddAssetModalRoute() {
  return (
    <FeatureErrorBoundary featureName="Add Asset">
      <AddAssetScreen />
    </FeatureErrorBoundary>
  )
}
