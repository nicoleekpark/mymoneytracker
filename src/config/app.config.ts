import type { AppConfig } from '@/types'
import { CURRENCIES } from './currencies.config'
import { FEATURE_FLAGS } from './feature-flags.config'

export const APP_CONFIG: AppConfig = {
  name: 'HoH Finance Tracker',
  version: '1.0.0',
  currency: CURRENCIES.USD,
  featureFlags: FEATURE_FLAGS
} as const // readonly
