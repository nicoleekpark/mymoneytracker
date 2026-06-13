import { rowToAccount, type AccountRow } from '@/infrastructure/mappers/account.mapper'

const TEST_CREATED_AT = '2026-01-01T00:00:00.000Z'

describe('account.mapper', () => {
  describe('rowToAccount', () => {
    it('converts valid row to Account', () => {
      const row: AccountRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'acct:checking',
        name: 'Chase Checking',
        nature: 'asset',
        kind: 'checking',
        created_at: TEST_CREATED_AT,
      }

      const account = rowToAccount(row)

      expect(account.id).toBe(row.id)
      expect(account.key).toBe(row.key)
      expect(account.name).toBe(row.name)
      expect(account.nature).toBe('asset')
      expect(account.kind).toBe('checking')
      expect(account.createdAt).toBe(TEST_CREATED_AT)
    })

    it('uses fallback for invalid nature', () => {
      const row: AccountRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'acct:test',
        name: 'Test Account',
        nature: 'invalid_nature',
        kind: 'checking',
        created_at: TEST_CREATED_AT,
      }

      const account = rowToAccount(row)

      expect(account.nature).toBe('asset') // fallback
    })

    it('uses fallback for invalid kind', () => {
      const row: AccountRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'acct:test',
        name: 'Test Account',
        nature: 'asset',
        kind: 'invalid_kind',
        created_at: TEST_CREATED_AT,
      }

      const account = rowToAccount(row)

      expect(account.kind).toBe('other') // fallback
    })

    it('handles liability accounts', () => {
      const row: AccountRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'acct:credit',
        name: 'Credit Card',
        nature: 'liability',
        kind: 'credit_card',
        created_at: TEST_CREATED_AT,
      }

      const account = rowToAccount(row)

      expect(account.nature).toBe('liability')
      expect(account.kind).toBe('credit_card')
    })
  })
})
