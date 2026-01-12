import { finishReport, newReport, type SeedReport } from './seed.report'
import { seedSystemAccounts } from './system.accounts.seed'
import { syncSystemCategoriesFromConfig } from './system.categories.seed'

export function runSystemSeeds(): SeedReport {
  const report = newReport()

  // order matters: accounts first if categories/tx reference later
  seedSystemAccounts(report)
  syncSystemCategoriesFromConfig(report)

  return finishReport(report)
}
