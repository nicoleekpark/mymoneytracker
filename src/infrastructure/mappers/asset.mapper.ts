import type {
  FamilyMember,
  AssetItem,
  AssetBalance,
  AssetGoal,
} from '@/domain/asset/asset.types'
import {
  normalizeFamilyMemberRole,
  normalizeAssetField,
  normalizeAssetCategory,
} from '@/domain/asset/asset.model'

// Database row types
export type FamilyMemberRow = {
  id: string
  name: string
  nickname: string
  role: string
  sort_order: number
  is_active: number
}

export type AssetItemRow = {
  id: string
  field: string
  category: string
  name: string
  member_id: string | null
  is_liquidifiable: number
  sort_order: number
  is_archived: number
}

export type AssetBalanceRow = {
  id: string
  asset_item_id: string
  year_month: string
  amount: number
}

export type AssetGoalRow = {
  id: string
  year: number
  target_growth: number
  start_net_worth: number
  start_year_month: string | null
}

// Row to domain mappers
export function rowToFamilyMember(row: FamilyMemberRow): FamilyMember {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    role: normalizeFamilyMemberRole(row.role),
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
  }
}

export function rowToAssetItem(row: AssetItemRow): AssetItem {
  return {
    id: row.id,
    field: normalizeAssetField(row.field),
    category: normalizeAssetCategory(row.category),
    name: row.name,
    memberId: row.member_id,
    isLiquidifiable: row.is_liquidifiable === 1,
    sortOrder: row.sort_order,
    isArchived: row.is_archived === 1,
  }
}

export function rowToAssetBalance(row: AssetBalanceRow): AssetBalance {
  return {
    id: row.id,
    assetItemId: row.asset_item_id,
    yearMonth: row.year_month,
    amount: row.amount,
  }
}

export function rowToAssetGoal(row: AssetGoalRow): AssetGoal {
  return {
    id: row.id,
    year: row.year,
    targetGrowth: row.target_growth,
    startNetWorth: row.start_net_worth,
    startYearMonth: row.start_year_month ?? `${row.year}-01`,
  }
}
