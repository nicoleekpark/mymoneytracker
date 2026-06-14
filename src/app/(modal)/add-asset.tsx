/**
 * Add Asset Modal Route
 *
 * Direct modal route for adding manual assets.
 * Pattern matches add-account.tsx (not nested under asset-settings).
 *
 * Route structure explanation:
 * - (tabs)/ contains the main tab screens
 * - (modal)/ contains full-screen modals that slide up
 * - Modal routes are direct files (add-account.tsx, add-asset.tsx)
 *   not nested folders, because they are standalone entry points
 * - Nested folders like asset-settings/ are for multi-screen flows
 *   within a single modal context (settings → detail → edit)
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
