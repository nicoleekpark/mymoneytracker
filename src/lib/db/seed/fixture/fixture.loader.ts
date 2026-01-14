import seedAccounts from '@/seeds/seed_accounts.json'
import seedTransactions from '@/seeds/seed_transactions.json'

export type FixtureName = 'accounts' | 'transactions'

export function getFixture(name: FixtureName): any {
  switch (name) {
    case 'accounts':
      return seedAccounts
    case 'transactions':
      return seedTransactions
    default:
      throw new Error(`Unknown fixture: ${name}`)
  }
}
