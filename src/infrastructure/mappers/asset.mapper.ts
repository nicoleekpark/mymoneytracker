/**
 * Asset Mapper
 *
 * Converts between SQLite rows and domain Asset objects.
 *
 * ## Coercion Conventions
 *
 * | DB Type | Domain Type | Conversion |
 * |---------|-------------|------------|
 * | `null` | `null` | Passed through (memberId can be null) |
 * | `number` (0/1) | `boolean` | `row.is_active === 1` |
 * | `string` (enum) | Typed enum | `parseAssetField(row.field)` |
 *
 * ## Validation
 * - All enum fields use Zod parse functions for runtime validation
 */

import type {
  FamilyMember,
  AssetItem,
  AssetBalance,
  AssetGoal,
} from '@/core/domain/asset/asset.types'
import {
  parseFamilyMemberRole,
  parseAssetField,
  parseAssetCategory,
} from '@/core/domain/asset/asset.schema'

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

// Row to domain mappers (using Zod schemas for runtime validation)
export function rowToFamilyMember(row: FamilyMemberRow): FamilyMember {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    role: parseFamilyMemberRole(row.role),
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
  }
}

export function rowToAssetItem(row: AssetItemRow): AssetItem {
  return {
    id: row.id,
    field: parseAssetField(row.field),
    category: parseAssetCategory(row.category),
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
