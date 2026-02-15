import { exec, queryFirst, queryAll, withTransaction } from '../../sqlite'
import { uuid } from '@/shared/utils/uuid'
import type { SeedReport } from '../seed.report'

/**
 * Asset fixture data for testing
 * Single user setup (Marge) with realistic US financial profile
 *
 * Target at 2025/12/31:
 * - Fixed Assets: $1,400,000 (real estate $1.1M, retirement $300k)
 * - Current Assets: $410,000 (90% investments, 1% cash, 9% other)
 * - Liabilities: $25,000
 * - Net Worth: $1,785,000
 *
 * Goal for 2026: $200,000 growth
 */

type FamilyMemberData = {
  id: string
  name: string
  nickname: string
  role: 'parent' | 'child'
}

type AssetItemData = {
  id: string
  field: 'fixed_assets' | 'current_assets' | 'liabilities'
  category: string
  name: string
  memberNickname: string | null // null = joint/primary user
}

type BalanceData = {
  assetName: string
  yearMonth: string
  amount: number
}

// Deterministic UUIDs for fixtures (so delete works correctly)
const MEMBER_IDS = {
  marge: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000002',
}

const ASSET_IDS = {
  // Fixed Assets - Real Estate
  home: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000001',
  // Fixed Assets - Retirement
  retirement_401k: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000011',
  retirement_ira: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000013',
  // Current Assets - Cash/Savings
  checking: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000020',
  savings: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000022',
  emergencyFund: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000023',
  hysa: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000025',
  // Current Assets - Investments
  brokerage: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000030',
  crypto: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000033',
  // Liabilities - Credit Cards
  cc_rewards: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000051',
  cc_cashback: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000052',
  // Liabilities - Loans
  personalLoan: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000060',
}

// Single user setup
const FAMILY_MEMBERS: FamilyMemberData[] = [
  { id: MEMBER_IDS.marge, name: 'Marge Simpson', nickname: 'Marge', role: 'parent' },
]

const ASSET_ITEMS: AssetItemData[] = [
  // Fixed Assets - Real Estate ($1,100,000)
  { id: ASSET_IDS.home, field: 'fixed_assets', category: 'real_estate', name: 'Primary Residence', memberNickname: null },

  // Fixed Assets - Retirement ($300,000 total)
  { id: ASSET_IDS.retirement_401k, field: 'fixed_assets', category: 'retirement_funds', name: '401(k)', memberNickname: null },
  { id: ASSET_IDS.retirement_ira, field: 'fixed_assets', category: 'retirement_funds', name: 'Roth IRA', memberNickname: null },

  // Current Assets - Cash/Savings ($41,000 = 10% of $410k)
  { id: ASSET_IDS.checking, field: 'current_assets', category: 'cash_savings', name: 'Checking Account', memberNickname: null },
  { id: ASSET_IDS.savings, field: 'current_assets', category: 'cash_savings', name: 'Savings Account', memberNickname: null },
  { id: ASSET_IDS.emergencyFund, field: 'current_assets', category: 'cash_savings', name: 'Emergency Fund', memberNickname: null },
  { id: ASSET_IDS.hysa, field: 'current_assets', category: 'cash_savings', name: 'High-Yield Savings', memberNickname: null },

  // Current Assets - Investments ($369,000 = 90% of $410k)
  { id: ASSET_IDS.brokerage, field: 'current_assets', category: 'investments', name: 'Brokerage Account', memberNickname: null },
  { id: ASSET_IDS.crypto, field: 'current_assets', category: 'investments', name: 'Crypto Portfolio', memberNickname: null },

  // Liabilities - Credit Cards ($5,000)
  { id: ASSET_IDS.cc_rewards, field: 'liabilities', category: 'credit_card', name: 'Rewards Card', memberNickname: null },
  { id: ASSET_IDS.cc_cashback, field: 'liabilities', category: 'credit_card', name: 'Cashback Card', memberNickname: null },

  // Liabilities - Loans ($20,000)
  { id: ASSET_IDS.personalLoan, field: 'liabilities', category: 'loans', name: 'Personal Loan', memberNickname: null },
]

/**
 * Target values at 2025/12/31
 */
const TARGETS_2025_12 = {
  // Fixed Assets: $1,400,000
  home: 1100000,
  retirement_401k: 200000,
  retirement_ira: 100000,

  // Current Assets: $410,000 (90% investments, 1% cash, 9% other savings)
  checking: 4100,        // 1% cash
  savings: 15000,        // emergency/savings buffer
  emergencyFund: 15000,  // 6 months expenses
  hysa: 6900,            // remaining
  brokerage: 350000,     // bulk of investments
  crypto: 19000,         // small crypto allocation

  // Liabilities: $25,000
  cc_rewards: -2500,
  cc_cashback: -2500,
  personalLoan: -20000,
}

/**
 * Generate balance history from 2024/01 to current month (2026/02)
 * Working backwards from 2025/12 targets with realistic growth rates
 */
function generateBalanceHistory(): BalanceData[] {
  const balances: BalanceData[] = []

  // Generate months from 2024/01 to current month
  const startDate = new Date(2024, 0, 1) // Jan 2024
  const now = new Date()
  const endDate = new Date(now.getFullYear(), now.getMonth(), 1)

  // Reference point: 2025/12
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const ym = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

    // Calculate months from reference point (2025/12)
    const monthsFromRef = (currentDate.getFullYear() - 2025) * 12 + (currentDate.getMonth() - 11)

    // Growth rates (monthly)
    const realEstateMonthlyGrowth = 0.003 // ~3.6% annual
    const investmentMonthlyGrowth = 0.0025 // ~3% annual (as specified)
    const retirementMonthlyGrowth = 0.005 // ~6% annual (with contributions)
    const loanMonthlyPaydown = 500 // $500/month principal

    // Calculate values based on distance from reference
    // Negative monthsFromRef = before Dec 2025, positive = after

    // Real Estate - slow appreciation
    const homeValue = Math.round(TARGETS_2025_12.home * Math.pow(1 + realEstateMonthlyGrowth, monthsFromRef))
    balances.push({ assetName: 'Primary Residence', yearMonth: ym, amount: homeValue })

    // Retirement - steady growth with contributions
    const k401Value = Math.round(TARGETS_2025_12.retirement_401k * Math.pow(1 + retirementMonthlyGrowth, monthsFromRef))
    const iraValue = Math.round(TARGETS_2025_12.retirement_ira * Math.pow(1 + retirementMonthlyGrowth, monthsFromRef))
    balances.push({ assetName: '401(k)', yearMonth: ym, amount: k401Value })
    balances.push({ assetName: 'Roth IRA', yearMonth: ym, amount: iraValue })

    // Cash/Savings - relatively stable with minor fluctuations
    const monthVariation = Math.sin(currentDate.getMonth() * 0.5) * 500 // seasonal variation
    balances.push({ assetName: 'Checking Account', yearMonth: ym, amount: Math.round(TARGETS_2025_12.checking + monthVariation) })
    balances.push({ assetName: 'Savings Account', yearMonth: ym, amount: Math.round(TARGETS_2025_12.savings - monthsFromRef * 200) }) // gradual build
    balances.push({ assetName: 'Emergency Fund', yearMonth: ym, amount: Math.round(TARGETS_2025_12.emergencyFund - monthsFromRef * 100) })
    balances.push({ assetName: 'High-Yield Savings', yearMonth: ym, amount: Math.round(TARGETS_2025_12.hysa - monthsFromRef * 50) })

    // Investments - 3% annual growth
    const brokerageValue = Math.round(TARGETS_2025_12.brokerage * Math.pow(1 + investmentMonthlyGrowth, monthsFromRef))
    const cryptoValue = Math.round(TARGETS_2025_12.crypto * Math.pow(1 + investmentMonthlyGrowth * 1.5, monthsFromRef)) // crypto slightly more volatile
    balances.push({ assetName: 'Brokerage Account', yearMonth: ym, amount: brokerageValue })
    balances.push({ assetName: 'Crypto Portfolio', yearMonth: ym, amount: cryptoValue })

    // Credit Cards - fluctuate monthly (paid off mostly each month)
    const ccVariation = Math.abs(Math.sin(currentDate.getMonth()) * 1000)
    balances.push({ assetName: 'Rewards Card', yearMonth: ym, amount: Math.round(TARGETS_2025_12.cc_rewards - ccVariation) })
    balances.push({ assetName: 'Cashback Card', yearMonth: ym, amount: Math.round(TARGETS_2025_12.cc_cashback + ccVariation * 0.5) })

    // Personal Loan - paying down over time
    const loanBalance = TARGETS_2025_12.personalLoan + (monthsFromRef * loanMonthlyPaydown)
    balances.push({ assetName: 'Personal Loan', yearMonth: ym, amount: Math.round(Math.min(loanBalance, 0)) })

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return balances
}

/**
 * Calculate net worth at 2025/12 for goal starting point
 */
function getNetWorthAt202512(): number {
  const fixedAssets = TARGETS_2025_12.home + TARGETS_2025_12.retirement_401k + TARGETS_2025_12.retirement_ira
  const currentAssets = TARGETS_2025_12.checking + TARGETS_2025_12.savings + TARGETS_2025_12.emergencyFund +
                        TARGETS_2025_12.hysa + TARGETS_2025_12.brokerage + TARGETS_2025_12.crypto
  const liabilities = Math.abs(TARGETS_2025_12.cc_rewards) + Math.abs(TARGETS_2025_12.cc_cashback) +
                      Math.abs(TARGETS_2025_12.personalLoan)

  return fixedAssets + currentAssets - liabilities
}

function getMemberIdByNickname(nickname: string | null): string | null {
  if (!nickname) return null
  const member = FAMILY_MEMBERS.find(m => m.nickname === nickname)
  return member?.id ?? null
}

function isLiquidifiable(category: string): boolean {
  return category === 'cash_savings' || category === 'investments'
}

export function applyFixtureAssets(report: SeedReport): void {
  const now = new Date().toISOString()

  withTransaction(() => {
    // 1. Insert family members
    for (const member of FAMILY_MEMBERS) {
      const existing = queryFirst<{ id: string }>('SELECT id FROM family_members WHERE id = ?', [member.id])
      if (existing) {
        report.assets.skipped++
        continue
      }

      exec(`
        INSERT INTO family_members (id, name, nickname, role, sort_order, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
      `, [member.id, member.name, member.nickname, member.role, FAMILY_MEMBERS.indexOf(member), now, now])
      report.assets.inserted++
    }

    // 2. Insert asset items
    let sortOrder = 0
    for (const item of ASSET_ITEMS) {
      const existing = queryFirst<{ id: string }>('SELECT id FROM asset_items WHERE id = ?', [item.id])
      if (existing) {
        report.assets.skipped++
        continue
      }

      const memberId = getMemberIdByNickname(item.memberNickname)

      exec(`
        INSERT INTO asset_items (id, field, category, name, member_id, is_liquidifiable, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `, [
        item.id,
        item.field,
        item.category,
        item.name,
        memberId,
        isLiquidifiable(item.category) ? 1 : 0,
        sortOrder++,
        now,
        now,
      ])
      report.assets.inserted++
    }

    // 3. Insert balance history
    const balances = generateBalanceHistory()

    for (const balance of balances) {
      const matchingItems = ASSET_ITEMS.filter(a => a.name === balance.assetName)

      for (const item of matchingItems) {
        const existing = queryFirst<{ id: string }>(
          'SELECT id FROM asset_balances WHERE asset_item_id = ? AND year_month = ?',
          [item.id, balance.yearMonth]
        )
        if (existing) continue

        exec(`
          INSERT INTO asset_balances (id, asset_item_id, year_month, amount, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [uuid(), item.id, balance.yearMonth, balance.amount, now, now])
      }
    }

    // 4. Insert 2026 goal
    // Goal set on 01/01/2026, target $200,000 growth
    // Start net worth = net worth at 2025/12
    const existingGoal = queryFirst<{ id: string }>('SELECT id FROM asset_goals WHERE year = ?', [2026])
    if (!existingGoal) {
      const startNetWorth = getNetWorthAt202512() // $1,785,000
      exec(`
        INSERT INTO asset_goals (id, year, target_growth, start_net_worth, start_year_month, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [uuid(), 2026, 200000, startNetWorth, '2026-01', now, now])
      report.assets.inserted++
    }
  })
}

export function deleteFixtureAssets(report: SeedReport): void {
  withTransaction(() => {
    // Delete in reverse order due to foreign keys
    // 1. Delete balances for fixture items
    for (const item of ASSET_ITEMS) {
      exec('DELETE FROM asset_balances WHERE asset_item_id = ?', [item.id])
    }

    // 2. Delete asset items
    for (const item of ASSET_ITEMS) {
      exec('DELETE FROM asset_items WHERE id = ?', [item.id])
      report.assets.deleted++
    }

    // 3. Delete family members
    for (const member of FAMILY_MEMBERS) {
      exec('DELETE FROM family_members WHERE id = ?', [member.id])
      report.assets.deleted++
    }

    // 4. Delete goals
    exec('DELETE FROM asset_goals WHERE year = ?', [2026])
  })
}
