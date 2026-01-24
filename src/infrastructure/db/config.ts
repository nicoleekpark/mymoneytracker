export type DbEnv = 'dev' | 'prod'

const env = process.env.EXPO_PUBLIC_DB_ENV

export function getDbEnv(): DbEnv {
  return env === 'prod' ? 'prod' : 'dev'
}

export function getDbName(): string {
  return getDbEnv() === 'prod' ? 'hoh_fi_prod.db' : 'hoh_fi_dev.db'
}
