import { uuid } from '@/shared/utils/uuid'
import type {
  FamilyMember,
  AssetItem,
  AssetBalance,
  AssetGoal,
  AssetSummary,
  AssetTrendPoint,
} from '@/domain/asset/asset.types'
import type { AssetRepository } from '@/domain/asset/asset.repository'
import { createEmptySummary, isLiquidifiableCategory } from '@/domain/asset/asset.model'
import type { DataSource } from '../db/DataSource'
import {
  rowToFamilyMember,
  rowToAssetItem,
  rowToAssetBalance,
  rowToAssetGoal,
  type FamilyMemberRow,
  type AssetItemRow,
  type AssetBalanceRow,
  type AssetGoalRow,
} from '../mappers/asset.mapper'

export class SqliteAssetRepository implements AssetRepository {
  constructor(private readonly dataSource: DataSource) {}

  // ─── Family Members ────────────────────────────────────────────────────────

  getFamilyMembers(): FamilyMember[] {
    const rows = this.dataSource.queryAll<FamilyMemberRow>(`
      SELECT id, name, nickname, role, sort_order, is_active
      FROM family_members
      WHERE is_active = 1
      ORDER BY
        CASE role WHEN 'parent' THEN 0 ELSE 1 END,
        sort_order ASC
    `)
    return rows.map(rowToFamilyMember)
  }

  getFamilyMemberById(id: string): FamilyMember | null {
    const row = this.dataSource.queryFirst<FamilyMemberRow>(`
      SELECT id, name, nickname, role, sort_order, is_active
      FROM family_members
      WHERE id = ?
    `, [id])
    return row ? rowToFamilyMember(row) : null
  }

  createFamilyMember(member: Omit<FamilyMember, 'id'>): FamilyMember {
    const id = uuid()
    this.dataSource.exec(`
      INSERT INTO family_members (id, name, nickname, role, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, member.name, member.nickname, member.role, member.sortOrder, member.isActive ? 1 : 0])

    return { id, ...member }
  }

  updateFamilyMember(id: string, updates: Partial<FamilyMember>): void {
    const sets: string[] = []
    const args: unknown[] = []

    if (updates.name !== undefined) {
      sets.push('name = ?')
      args.push(updates.name)
    }
    if (updates.nickname !== undefined) {
      sets.push('nickname = ?')
      args.push(updates.nickname)
    }
    if (updates.role !== undefined) {
      sets.push('role = ?')
      args.push(updates.role)
    }
    if (updates.sortOrder !== undefined) {
      sets.push('sort_order = ?')
      args.push(updates.sortOrder)
    }
    if (updates.isActive !== undefined) {
      sets.push('is_active = ?')
      args.push(updates.isActive ? 1 : 0)
    }

    if (sets.length === 0) return

    sets.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')")
    args.push(id)

    this.dataSource.exec(`
      UPDATE family_members
      SET ${sets.join(', ')}
      WHERE id = ?
    `, args)
  }

  deleteFamilyMember(id: string): void {
    this.dataSource.exec(`DELETE FROM family_members WHERE id = ?`, [id])
  }

  // ─── Asset Items ──────────────────────────────────────────────────────────

  getAssetItems(memberId?: string | null): AssetItem[] {
    let sql = `
      SELECT id, field, category, name, member_id, is_liquidifiable, sort_order, is_archived
      FROM asset_items
      WHERE is_archived = 0
    `
    const args: unknown[] = []

    if (memberId === null) {
      sql += ' AND member_id IS NULL'
    } else if (memberId !== undefined) {
      sql += ' AND (member_id = ? OR member_id IS NULL)'
      args.push(memberId)
    }

    sql += ` ORDER BY
      CASE field
        WHEN 'fixed_assets' THEN 0
        WHEN 'current_assets' THEN 1
        WHEN 'liabilities' THEN 2
        ELSE 9
      END,
      sort_order ASC
    `

    const rows = this.dataSource.queryAll<AssetItemRow>(sql, args)
    return rows.map(rowToAssetItem)
  }

  getAssetItemById(id: string): AssetItem | null {
    const row = this.dataSource.queryFirst<AssetItemRow>(`
      SELECT id, field, category, name, member_id, is_liquidifiable, sort_order, is_archived
      FROM asset_items
      WHERE id = ?
    `, [id])
    return row ? rowToAssetItem(row) : null
  }

  createAssetItem(item: Omit<AssetItem, 'id'>): AssetItem {
    const id = uuid()
    this.dataSource.exec(`
      INSERT INTO asset_items (id, field, category, name, member_id, is_liquidifiable, sort_order, is_archived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      item.field,
      item.category,
      item.name,
      item.memberId,
      item.isLiquidifiable ? 1 : 0,
      item.sortOrder,
      item.isArchived ? 1 : 0,
    ])

    return { id, ...item }
  }

  updateAssetItem(id: string, updates: Partial<AssetItem>): void {
    const sets: string[] = []
    const args: unknown[] = []

    if (updates.field !== undefined) {
      sets.push('field = ?')
      args.push(updates.field)
    }
    if (updates.category !== undefined) {
      sets.push('category = ?')
      args.push(updates.category)
    }
    if (updates.name !== undefined) {
      sets.push('name = ?')
      args.push(updates.name)
    }
    if (updates.memberId !== undefined) {
      sets.push('member_id = ?')
      args.push(updates.memberId)
    }
    if (updates.isLiquidifiable !== undefined) {
      sets.push('is_liquidifiable = ?')
      args.push(updates.isLiquidifiable ? 1 : 0)
    }
    if (updates.sortOrder !== undefined) {
      sets.push('sort_order = ?')
      args.push(updates.sortOrder)
    }
    if (updates.isArchived !== undefined) {
      sets.push('is_archived = ?')
      args.push(updates.isArchived ? 1 : 0)
    }

    if (sets.length === 0) return

    sets.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')")
    args.push(id)

    this.dataSource.exec(`
      UPDATE asset_items
      SET ${sets.join(', ')}
      WHERE id = ?
    `, args)
  }

  deleteAssetItem(id: string): void {
    this.dataSource.exec(`DELETE FROM asset_items WHERE id = ?`, [id])
  }

  // ─── Balances ─────────────────────────────────────────────────────────────

  getBalance(assetItemId: string, yearMonth: string): AssetBalance | null {
    const row = this.dataSource.queryFirst<AssetBalanceRow>(`
      SELECT id, asset_item_id, year_month, amount
      FROM asset_balances
      WHERE asset_item_id = ? AND year_month = ?
    `, [assetItemId, yearMonth])
    return row ? rowToAssetBalance(row) : null
  }

  getBalancesForItem(assetItemId: string): AssetBalance[] {
    const rows = this.dataSource.queryAll<AssetBalanceRow>(`
      SELECT id, asset_item_id, year_month, amount
      FROM asset_balances
      WHERE asset_item_id = ?
      ORDER BY year_month DESC
    `, [assetItemId])
    return rows.map(rowToAssetBalance)
  }

  getBalancesForMonth(yearMonth: string, memberId?: string | null): AssetBalance[] {
    // Get the most recent balance for each asset item up to the requested month
    // This ensures balances carry forward when no new value is recorded
    let sql = `
      SELECT b.id, b.asset_item_id, b.year_month, b.amount
      FROM asset_balances b
      JOIN asset_items i ON b.asset_item_id = i.id
      WHERE b.year_month = (
        SELECT MAX(b2.year_month)
        FROM asset_balances b2
        WHERE b2.asset_item_id = b.asset_item_id
          AND b2.year_month <= ?
      )
        AND i.is_archived = 0
    `
    const args: unknown[] = [yearMonth]

    if (memberId === null) {
      sql += ' AND i.member_id IS NULL'
    } else if (memberId !== undefined) {
      sql += ' AND (i.member_id = ? OR i.member_id IS NULL)'
      args.push(memberId)
    }

    const rows = this.dataSource.queryAll<AssetBalanceRow>(sql, args)
    return rows.map(rowToAssetBalance)
  }

  setBalance(assetItemId: string, yearMonth: string, amount: number): AssetBalance {
    const existing = this.getBalance(assetItemId, yearMonth)

    if (existing) {
      this.dataSource.exec(`
        UPDATE asset_balances
        SET amount = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
        WHERE id = ?
      `, [amount, existing.id])
      return { ...existing, amount }
    }

    const id = uuid()
    this.dataSource.exec(`
      INSERT INTO asset_balances (id, asset_item_id, year_month, amount)
      VALUES (?, ?, ?, ?)
    `, [id, assetItemId, yearMonth, amount])

    return { id, assetItemId, yearMonth, amount }
  }

  deleteBalance(id: string): void {
    this.dataSource.exec(`DELETE FROM asset_balances WHERE id = ?`, [id])
  }

  // ─── Goals ────────────────────────────────────────────────────────────────

  getGoalForYear(year: number): AssetGoal | null {
    const row = this.dataSource.queryFirst<AssetGoalRow>(`
      SELECT id, year, target_growth, start_net_worth, start_year_month
      FROM asset_goals
      WHERE year = ?
    `, [year])
    return row ? rowToAssetGoal(row) : null
  }

  setGoal(year: number, targetGrowth: number, startNetWorth: number, startYearMonth?: string): AssetGoal {
    const existing = this.getGoalForYear(year)
    const startMonth = startYearMonth ?? `${year}-01`

    if (existing) {
      this.dataSource.exec(`
        UPDATE asset_goals
        SET target_growth = ?, start_net_worth = ?, start_year_month = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
        WHERE year = ?
      `, [targetGrowth, startNetWorth, startMonth, year])
      return { ...existing, targetGrowth, startNetWorth, startYearMonth: startMonth }
    }

    const id = uuid()
    this.dataSource.exec(`
      INSERT INTO asset_goals (id, year, target_growth, start_net_worth, start_year_month)
      VALUES (?, ?, ?, ?, ?)
    `, [id, year, targetGrowth, startNetWorth, startMonth])

    return { id, year, targetGrowth, startNetWorth, startYearMonth: startMonth }
  }

  deleteGoal(year: number): void {
    this.dataSource.exec(`DELETE FROM asset_goals WHERE year = ?`, [year])
  }

  // ─── Computed ─────────────────────────────────────────────────────────────

  getSummary(yearMonth: string, memberId?: string | null): AssetSummary {
    const summary = createEmptySummary()

    // Get the most recent balance for each asset item up to the requested month
    // This ensures balances carry forward when no new value is recorded
    type BalanceWithItem = AssetBalanceRow & {
      field: string
      category: string
      is_liquidifiable: number
    }

    let sql = `
      SELECT b.id, b.asset_item_id, b.year_month, b.amount,
             i.field, i.category, i.is_liquidifiable
      FROM asset_balances b
      JOIN asset_items i ON b.asset_item_id = i.id
      WHERE b.year_month = (
        SELECT MAX(b2.year_month)
        FROM asset_balances b2
        WHERE b2.asset_item_id = b.asset_item_id
          AND b2.year_month <= ?
      )
        AND i.is_archived = 0
    `
    const args: unknown[] = [yearMonth]

    if (memberId === null) {
      sql += ' AND i.member_id IS NULL'
    } else if (memberId !== undefined) {
      sql += ' AND (i.member_id = ? OR i.member_id IS NULL)'
      args.push(memberId)
    }

    const rows = this.dataSource.queryAll<BalanceWithItem>(sql, args)

    for (const row of rows) {
      const amount = row.amount
      const field = row.field as keyof typeof summary.byField
      const category = row.category as keyof typeof summary.byCategory

      // Aggregate by field
      if (field in summary.byField) {
        summary.byField[field] += amount
      }

      // Aggregate by category
      if (category in summary.byCategory) {
        summary.byCategory[category] += amount
      }

      // Calculate totals
      if (field === 'liabilities') {
        summary.totalLiabilities += Math.abs(amount)
      } else {
        summary.totalAssets += amount
      }

      // Liquidifiable (exclude kids and retirement)
      if (row.is_liquidifiable === 1 && category !== 'kids' && category !== 'retirement_funds') {
        summary.liquidifiableAmount += amount
      }
    }

    summary.netWorth = summary.totalAssets - summary.totalLiabilities

    return summary
  }

  getTrend(months: number, memberId?: string | null): AssetTrendPoint[] {
    // Generate list of year-months to query
    const yearMonths: string[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      yearMonths.push(ym)
    }

    // Get summary for each month
    return yearMonths.map(ym => {
      const summary = this.getSummary(ym, memberId)
      return {
        yearMonth: ym,
        netWorth: summary.netWorth,
        totalAssets: summary.totalAssets,
        totalLiabilities: summary.totalLiabilities,
        liquidifiable: summary.liquidifiableAmount,
      }
    })
  }

  getYearsWithData(): number[] {
    // Get distinct years from balances
    const balanceYears = this.dataSource.queryAll<{ year: string }>(`
      SELECT DISTINCT substr(year_month, 1, 4) as year
      FROM asset_balances
      ORDER BY year DESC
    `)

    // Get distinct years from goals
    const goalYears = this.dataSource.queryAll<{ year: number }>(`
      SELECT DISTINCT year
      FROM asset_goals
      ORDER BY year DESC
    `)

    // Combine and deduplicate
    const yearsSet = new Set<number>()
    for (const row of balanceYears) {
      yearsSet.add(parseInt(row.year, 10))
    }
    for (const row of goalYears) {
      yearsSet.add(row.year)
    }

    // Always include current year
    yearsSet.add(new Date().getFullYear())

    return Array.from(yearsSet).sort((a, b) => b - a) // Descending
  }
}
