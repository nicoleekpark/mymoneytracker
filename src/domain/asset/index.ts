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
  normalizeFamilyMemberRole,
  normalizeAssetField,
  normalizeAssetCategory,
  createEmptySummary,
  getLiquidityHealth,
  formatLiquidityMonths,
} from './asset.model'

// Repository interface
export type { AssetRepository } from './asset.repository'

// Use cases
export {
  getCurrentYearMonth,
  getFamilyMembers,
  getFamilyMemberById,
  createFamilyMember,
  getAssetItems,
  getAssetItemsGrouped,
  createAssetItem,
  setBalance,
  getBalancesForMonth,
  getSummary,
  getTrend,
  getGoal,
  setGoal,
  getGoalProgress,
  getAssetProjection,
  suggestAnnualGoal,
  getYearsWithData,
} from './asset.usecase'

export type { AssetProjection } from './asset.usecase'
