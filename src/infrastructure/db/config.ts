export type DbEnv = 'dev' | 'staging' | 'prod'

const env = process.env.EXPO_PUBLIC_DB_ENV

export function getDbEnv(): DbEnv {
  if (env === 'prod') return 'prod'
  if (env === 'staging') return 'staging'
  return 'dev'
}

export function getDbName(): string {
  const dbEnv = getDbEnv()
  if (dbEnv === 'prod') return 'mmt_prod.db'
  if (dbEnv === 'staging') return 'mmt_staging.db'
  return 'mmt_dev.db'
}
