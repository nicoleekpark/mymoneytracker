// Application layer - Asset services
// Orchestrates domain types + infrastructure repositories

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
} from './asset.service'

export type { AssetProjection } from './asset.service'
