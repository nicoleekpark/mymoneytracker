import { finishReport, newReport, type SeedReport } from '../seed.report'
import {
  applyFixtureAccounts,
  applyFixtureTransactions,
  deleteFixtureAccounts,
  deleteFixtureTransactions
} from './fixture.apply'
import { getFixture, type FixtureName } from './fixture.loader'
import type { SeedAccountsFile, SeedTransactionsFile } from './fixture.types'

export type FixtureAction = 'seed' | 'delete'

export function runFixtures(action: FixtureAction, targets: FixtureName[]): SeedReport {
  const report = newReport()

  // order matters
  const ordered: FixtureName[] =
    action === 'seed'
      ? (['accounts', 'transactions'] as const).filter(x => targets.includes(x))
      : (['transactions', 'accounts'] as const).filter(x => targets.includes(x))

  for (const name of ordered) {
    const data = getFixture(name)

    if (name === 'accounts') {
      const file = data as SeedAccountsFile
      if (action === 'seed') applyFixtureAccounts(file, report)
      else deleteFixtureAccounts(file, report)
    }

    if (name === 'transactions') {
      const file = data as SeedTransactionsFile
      if (action === 'seed') applyFixtureTransactions(file, report)
      else deleteFixtureTransactions(file, report)
    }
  }

  return finishReport(report)
}
