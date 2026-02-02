import { finishReport, newReport, type SeedReport } from './seed.report'
import { seedSystemAccounts } from './system.accounts.seed'
import { syncSystemCategoriesFromConfig } from './system.categories.seed'
import { seedSystemTags } from './system.tags.seed'

/**
 * Run system seeds on app startup.
 * These are required for the app to function (accounts, categories, tags).
 *
 * Dev fixtures (notifications, suggestions) are loaded via DevToolsOverlay,
 * not automatically on startup.
 */
export function runSystemSeeds(): SeedReport {
  const report = newReport()

  // Order matters: accounts first, then categories, then tags
  seedSystemAccounts(report)
  syncSystemCategoriesFromConfig(report)
  seedSystemTags(report)

  return finishReport(report)
}
