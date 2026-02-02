import { finishReport, newReport, type SeedReport } from '../seed.report'
import {
  applyFixtureAccounts,
  applyFixtureTransactions,
  deleteFixtureAccounts,
  deleteFixtureTransactions
} from './fixture.apply'
import {
  applyFixtureNotifications,
  deleteFixtureNotifications,
} from './fixture.notifications'
import {
  applyFixtureSuggestions,
  deleteAllSuggestions,
} from './fixture.suggestions'
import { type FixtureName } from './fixture.loader'
import type { SeedAccountsFile, SeedTransactionsFile } from './fixture.types'

export type FixtureAction = 'seed' | 'delete'

// Define fixture order for seed and delete operations
const SEED_ORDER: FixtureName[] = ['accounts', 'transactions', 'notifications', 'suggestions']
const DELETE_ORDER: FixtureName[] = ['suggestions', 'notifications', 'transactions', 'accounts']

export function runFixtures(action: FixtureAction, targets: FixtureName[]): SeedReport {
  const report = newReport()

  // order matters
  const ordered = action === 'seed'
    ? SEED_ORDER.filter(x => targets.includes(x))
    : DELETE_ORDER.filter(x => targets.includes(x))

  for (const name of ordered) {
    if (name === 'accounts') {
      // Import dynamically to avoid circular deps
      const { getFixture } = require('./fixture.loader')
      const file = getFixture(name) as SeedAccountsFile
      if (action === 'seed') applyFixtureAccounts(file, report)
      else deleteFixtureAccounts(file, report)
    }

    if (name === 'transactions') {
      const { getFixture } = require('./fixture.loader')
      const file = getFixture(name) as SeedTransactionsFile
      if (action === 'seed') applyFixtureTransactions(file, report)
      else deleteFixtureTransactions(file, report)
    }

    if (name === 'notifications') {
      if (action === 'seed') applyFixtureNotifications(report)
      else deleteFixtureNotifications(report)
    }

    if (name === 'suggestions') {
      if (action === 'seed') applyFixtureSuggestions(report)
      else deleteAllSuggestions(report)
    }
  }

  return finishReport(report)
}
