export type SeedCounts = {
  inserted: number
  updated: number
  skipped: number
  conflicts: number
}

export type SeedReport = {
  startedAt: string
  finishedAt?: string

  accounts: SeedCounts
  categories: SeedCounts
}

export function newSeedCounts(): SeedCounts {
  return { inserted: 0, updated: 0, skipped: 0, conflicts: 0 }
}

export function newReport(): SeedReport {
  return {
    startedAt: new Date().toISOString(),
    accounts: newSeedCounts(),
    categories: newSeedCounts()
  }
}

export function finishReport(report: SeedReport): SeedReport {
  return { ...report, finishedAt: new Date().toISOString() }
}
