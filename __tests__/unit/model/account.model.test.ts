import {
  accountNatureSortRank,
  accountKindSortRank,
  isAssetAccount,
  isLiabilityAccount,
  isCashAccount,
  isCreditCard,
} from '@/core/domain/account/account.model'
import type { Account } from '@/core/domain/account/account.types'

const mockAssetAccount: Account = {
  id: 'acc-1',
  key: 'acct:checking',
  name: 'Checking Account',
  nature: 'asset',
  kind: 'checking',
}

const mockLiabilityAccount: Account = {
  id: 'acc-2',
  key: 'acct:credit_card',
  name: 'Credit Card',
  nature: 'liability',
  kind: 'credit_card',
}

const mockCashAccount: Account = {
  id: 'acc-3',
  key: 'acct:cash',
  name: 'Cash Wallet',
  nature: 'asset',
  kind: 'cash',
}

describe('account.model', () => {
  describe('accountNatureSortRank', () => {
    it('ranks asset before liability', () => {
      const assetRank = accountNatureSortRank('asset')
      const liabilityRank = accountNatureSortRank('liability')
      expect(assetRank).toBeLessThan(liabilityRank)
    })

    it('returns specific values', () => {
      expect(accountNatureSortRank('asset')).toBe(0)
      expect(accountNatureSortRank('liability')).toBe(1)
    })

    it('returns high rank for unknown values', () => {
      // @ts-expect-error testing invalid input
      expect(accountNatureSortRank('unknown')).toBe(9)
    })
  })

  describe('accountKindSortRank', () => {
    it('ranks kinds in expected order', () => {
      const checkingRank = accountKindSortRank('checking')
      const savingsRank = accountKindSortRank('savings')
      const cashRank = accountKindSortRank('cash')
      const creditCardRank = accountKindSortRank('credit_card')

      expect(checkingRank).toBeLessThan(savingsRank)
      expect(savingsRank).toBeLessThan(cashRank)
      expect(cashRank).toBeLessThan(creditCardRank)
    })

    it('returns specific values', () => {
      expect(accountKindSortRank('checking')).toBe(0)
      expect(accountKindSortRank('savings')).toBe(1)
      expect(accountKindSortRank('cash')).toBe(2)
      expect(accountKindSortRank('credit_card')).toBe(3)
      expect(accountKindSortRank('investment')).toBe(4)
      expect(accountKindSortRank('loan')).toBe(5)
    })

    it('returns high rank for other/unknown', () => {
      expect(accountKindSortRank('other')).toBe(9)
      // @ts-expect-error testing invalid input
      expect(accountKindSortRank('unknown')).toBe(9)
    })
  })

  describe('isAssetAccount', () => {
    it('returns true for asset accounts', () => {
      expect(isAssetAccount(mockAssetAccount)).toBe(true)
      expect(isAssetAccount(mockCashAccount)).toBe(true)
    })

    it('returns false for liability accounts', () => {
      expect(isAssetAccount(mockLiabilityAccount)).toBe(false)
    })
  })

  describe('isLiabilityAccount', () => {
    it('returns true for liability accounts', () => {
      expect(isLiabilityAccount(mockLiabilityAccount)).toBe(true)
    })

    it('returns false for asset accounts', () => {
      expect(isLiabilityAccount(mockAssetAccount)).toBe(false)
    })
  })

  describe('isCashAccount', () => {
    it('returns true for cash accounts', () => {
      expect(isCashAccount(mockCashAccount)).toBe(true)
    })

    it('returns false for non-cash accounts', () => {
      expect(isCashAccount(mockAssetAccount)).toBe(false)
      expect(isCashAccount(mockLiabilityAccount)).toBe(false)
    })
  })

  describe('isCreditCard', () => {
    it('returns true for credit card accounts', () => {
      expect(isCreditCard(mockLiabilityAccount)).toBe(true)
    })

    it('returns false for non-credit card accounts', () => {
      expect(isCreditCard(mockAssetAccount)).toBe(false)
      expect(isCreditCard(mockCashAccount)).toBe(false)
    })
  })
})
