import seedAccounts from '../data/seed_accounts.json'
import seedTransactions from '../data/seed_transactions.json'
import seedNotifications from '../data/seed_notifications.json'
import seedSuggestions from '../data/seed_suggestions.json'

export type FixtureName = 'accounts' | 'transactions' | 'notifications' | 'suggestions' | 'assets'

export function getFixture(name: FixtureName): any {
  switch (name) {
    case 'accounts':
      return seedAccounts
    case 'transactions':
      return seedTransactions
    case 'notifications':
      return seedNotifications
    case 'suggestions':
      return seedSuggestions
    case 'assets':
      // Assets fixture is generated in code, not loaded from JSON
      return null
    default:
      throw new Error(`Unknown fixture: ${name}`)
  }
}
