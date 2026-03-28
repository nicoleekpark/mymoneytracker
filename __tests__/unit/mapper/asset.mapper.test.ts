import {
  rowToFamilyMember,
  rowToAssetItem,
  rowToAssetBalance,
  rowToAssetGoal,
  type FamilyMemberRow,
  type AssetItemRow,
  type AssetBalanceRow,
  type AssetGoalRow,
} from '@/infrastructure/mappers/asset.mapper'

describe('asset.mapper', () => {
  describe('rowToFamilyMember', () => {
    it('converts valid row to FamilyMember', () => {
      const row: FamilyMemberRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        nickname: 'John',
        role: 'parent',
        sort_order: 0,
        is_active: 1,
      }

      const member = rowToFamilyMember(row)

      expect(member.id).toBe(row.id)
      expect(member.name).toBe('John Doe')
      expect(member.nickname).toBe('John')
      expect(member.role).toBe('parent')
      expect(member.sortOrder).toBe(0)
      expect(member.isActive).toBe(true)
    })

    it('converts is_active 0 to false', () => {
      const row: FamilyMemberRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Jane',
        nickname: 'Jane',
        role: 'child',
        sort_order: 1,
        is_active: 0,
      }

      const member = rowToFamilyMember(row)

      expect(member.isActive).toBe(false)
    })

    it('uses fallback for invalid role', () => {
      const row: FamilyMemberRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test',
        nickname: 'Test',
        role: 'invalid_role',
        sort_order: 0,
        is_active: 1,
      }

      const member = rowToFamilyMember(row)

      expect(member.role).toBe('parent') // fallback
    })
  })

  describe('rowToAssetItem', () => {
    it('converts valid row to AssetItem', () => {
      const row: AssetItemRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        field: 'current_assets',
        category: 'cash_savings',
        name: 'Emergency Fund',
        member_id: null,
        is_liquidifiable: 1,
        sort_order: 0,
        is_archived: 0,
      }

      const item = rowToAssetItem(row)

      expect(item.id).toBe(row.id)
      expect(item.field).toBe('current_assets')
      expect(item.category).toBe('cash_savings')
      expect(item.name).toBe('Emergency Fund')
      expect(item.memberId).toBeNull()
      expect(item.isLiquidifiable).toBe(true)
      expect(item.sortOrder).toBe(0)
      expect(item.isArchived).toBe(false)
    })

    it('uses fallback for invalid field', () => {
      const row: AssetItemRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        field: 'invalid_field',
        category: 'cash_savings',
        name: 'Test',
        member_id: null,
        is_liquidifiable: 1,
        sort_order: 0,
        is_archived: 0,
      }

      const item = rowToAssetItem(row)

      expect(item.field).toBe('current_assets') // fallback
    })

    it('uses fallback for invalid category', () => {
      const row: AssetItemRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        field: 'current_assets',
        category: 'invalid_category',
        name: 'Test',
        member_id: null,
        is_liquidifiable: 1,
        sort_order: 0,
        is_archived: 0,
      }

      const item = rowToAssetItem(row)

      expect(item.category).toBe('other') // fallback
    })
  })

  describe('rowToAssetBalance', () => {
    it('converts valid row to AssetBalance', () => {
      const row: AssetBalanceRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        asset_item_id: '660e8400-e29b-41d4-a716-446655440001',
        year_month: '2026-03',
        amount: 10000,
      }

      const balance = rowToAssetBalance(row)

      expect(balance.id).toBe(row.id)
      expect(balance.assetItemId).toBe(row.asset_item_id)
      expect(balance.yearMonth).toBe('2026-03')
      expect(balance.amount).toBe(10000)
    })
  })

  describe('rowToAssetGoal', () => {
    it('converts valid row to AssetGoal', () => {
      const row: AssetGoalRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        year: 2026,
        target_growth: 10,
        start_net_worth: 100000,
        start_year_month: '2026-01',
      }

      const goal = rowToAssetGoal(row)

      expect(goal.id).toBe(row.id)
      expect(goal.year).toBe(2026)
      expect(goal.targetGrowth).toBe(10)
      expect(goal.startNetWorth).toBe(100000)
      expect(goal.startYearMonth).toBe('2026-01')
    })

    it('defaults startYearMonth to January of the year when null', () => {
      const row: AssetGoalRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        year: 2026,
        target_growth: 10,
        start_net_worth: 100000,
        start_year_month: null,
      }

      const goal = rowToAssetGoal(row)

      expect(goal.startYearMonth).toBe('2026-01')
    })
  })
})
