// Domain layer - Asset (pure types, models, interfaces)
// Use cases moved to @/application/asset

// Types
export type {
  AssetField,
  AssetCategory,
  FamilyMemberRole,
  FamilyMember,
  AssetItem,
  AssetBalance,
  AssetGoal,
  AssetCategoryMeta,
  AssetSummary,
  AssetTrendPoint,
  AssetProjection,
} from './asset.types'

export { LIQUIDIFIABLE_CATEGORIES } from './asset.types'

// Models
export {
  ASSET_CATEGORIES,
  ASSET_FIELD_NAMES,
  LIQUIDITY_THRESHOLDS,
  getFieldSortOrder,
  getCategorySortOrder,
  getCategoryMeta,
  getCategoriesForField,
  isLiquidifiableCategory,
  isLiquidifiable,
  createEmptySummary,
  getLiquidityHealth,
  formatLiquidityMonths,
} from './asset.model'

// Zod schemas for runtime validation
export {
  AssetFieldSchema,
  AssetCategorySchema,
  FamilyMemberRoleSchema,
  parseAssetField,
  parseAssetCategory,
  parseFamilyMemberRole,
} from './asset.schema'

// Repository interface
export type { AssetRepository } from './asset.repository'
