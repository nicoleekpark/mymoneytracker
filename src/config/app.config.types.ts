import type { Currency } from './currencies.types'
import type { FeatureFlags } from './feature-flags.types'

export type AppConfig = Readonly<{
  name: string
  version: string
  currency: Currency
  featureFlags: FeatureFlags
}>