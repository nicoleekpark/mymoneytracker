export type SeedCounts = {
  inserted: number
  updated: number
  deleted: number
  skipped: number
  conflicts: number
}

export type SeedReport = {
  startedAt: string
  finishedAt?: string

  accounts: SeedCounts
  categories: SeedCounts
  transactions: SeedCounts
  tags: SeedCounts
  notifications: SeedCounts
  suggestions: SeedCounts
  drafts: SeedCounts
}

export function newSeedCounts(): SeedCounts {
  return { inserted: 0, updated: 0, deleted: 0, skipped: 0, conflicts: 0 }
}

export function newReport(): SeedReport {
  return {
    startedAt: new Date().toISOString(),
    accounts: newSeedCounts(),
    categories: newSeedCounts(),
    transactions: newSeedCounts(),
    tags: newSeedCounts(),
    notifications: newSeedCounts(),
    suggestions: newSeedCounts(),
    drafts: newSeedCounts(),
  }
}

export function finishReport(report: SeedReport): SeedReport {
  return { ...report, finishedAt: new Date().toISOString() }
}
