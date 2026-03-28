import { getActiveAccounts, resolveAccountIdByKey } from '@/core/services/account'

// Mock the repository module
jest.mock('@/infrastructure/repositories', () => ({
  accountRepository: {
    listActive: jest.fn(),
    getIdByKey: jest.fn(),
  },
}))

import { accountRepository } from '@/infrastructure/repositories'

const mockListActive = accountRepository.listActive as jest.MockedFunction<typeof accountRepository.listActive>
const mockGetIdByKey = accountRepository.getIdByKey as jest.MockedFunction<typeof accountRepository.getIdByKey>

describe('account.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getActiveAccounts', () => {
    it('returns accounts from repository', () => {
      const mockAccounts = [
        { id: '1', key: 'acct:checking', name: 'Checking', nature: 'debit', kind: 'checking', isArchived: false, sortOrder: 1 },
        { id: '2', key: 'acct:savings', name: 'Savings', nature: 'debit', kind: 'savings', isArchived: false, sortOrder: 2 },
      ] as any[]

      mockListActive.mockReturnValue(mockAccounts)

      const result = getActiveAccounts()

      expect(mockListActive).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockAccounts)
    })

    it('returns empty array when no accounts', () => {
      mockListActive.mockReturnValue([])

      const result = getActiveAccounts()

      expect(result).toEqual([])
    })
  })

  describe('resolveAccountIdByKey', () => {
    it('returns UUID for valid key', () => {
      const mockId = '550e8400-e29b-41d4-a716-446655440000'
      mockGetIdByKey.mockReturnValue(mockId)

      const result = resolveAccountIdByKey('acct:cash_wallet')

      expect(mockGetIdByKey).toHaveBeenCalledWith('acct:cash_wallet')
      expect(result).toBe(mockId)
    })
  })
})
