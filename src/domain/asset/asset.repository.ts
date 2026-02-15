import type {
  FamilyMember,
  AssetItem,
  AssetBalance,
  AssetGoal,
  AssetSummary,
  AssetTrendPoint,
} from './asset.types'

/**
 * Asset Repository Interface
 * Defines data access contract for asset management
 */
export interface AssetRepository {
  // Family Members
  getFamilyMembers(): FamilyMember[]
  getFamilyMemberById(id: string): FamilyMember | null
  createFamilyMember(member: Omit<FamilyMember, 'id'>): FamilyMember
  updateFamilyMember(id: string, updates: Partial<FamilyMember>): void
  deleteFamilyMember(id: string): void

  // Asset Items
  getAssetItems(memberId?: string | null): AssetItem[]
  getAssetItemById(id: string): AssetItem | null
  createAssetItem(item: Omit<AssetItem, 'id'>): AssetItem
  updateAssetItem(id: string, updates: Partial<AssetItem>): void
  deleteAssetItem(id: string): void

  // Balances
  getBalance(assetItemId: string, yearMonth: string): AssetBalance | null
  getBalancesForItem(assetItemId: string): AssetBalance[]
  getBalancesForMonth(yearMonth: string, memberId?: string | null): AssetBalance[]
  setBalance(assetItemId: string, yearMonth: string, amount: number): AssetBalance
  deleteBalance(id: string): void

  // Goals
  getGoalForYear(year: number): AssetGoal | null
  setGoal(year: number, targetGrowth: number, startNetWorth: number, startYearMonth?: string): AssetGoal
  deleteGoal(year: number): void

  // Computed
  getSummary(yearMonth: string, memberId?: string | null): AssetSummary
  getTrend(months: number, memberId?: string | null): AssetTrendPoint[]
  getYearsWithData(): number[]
}
