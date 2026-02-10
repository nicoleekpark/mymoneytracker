import type { FeatureFlags } from './feature-flags.types'

const isDev = __DEV__ || process.env.EXPO_PUBLIC_DEV_TOOLS === 'true'

export const FEATURE_FLAGS: FeatureFlags = {
  // Core features
  familySharing: false,
  bankConnection: false,
  bankSync: false,
  receiptCapture: false,
  notifications: true,
  suggestions: true,
  budgeting: false,
  reports: false,
  widget: false,

  // A/B testing
  heroVariant: 'optionA',  // 'current' = % saved hero, 'optionA' = net outcome hero

  // Developer tools
  devTools: isDev,
  devSeedNotifications: isDev,  // Auto-seed mock notifications in dev
  devSeedSuggestions: isDev,    // Auto-seed suggestion data in dev
}
