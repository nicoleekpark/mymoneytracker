export type HeroVariant = 'current' | 'optionA'

export type FeatureFlags = Readonly<{
  // Core features
  familySharing: boolean
  bankConnection: boolean
  bankSync: boolean
  receiptCapture: boolean
  notifications: boolean
  suggestions: boolean
  budgeting: boolean
  reports: boolean
  widget: boolean

  // A/B testing
  heroVariant: HeroVariant  // Dashboard hero style: 'current' (% saved) vs 'optionA' (net outcome)

  // Developer tools
  devTools: boolean
  devSeedNotifications: boolean  // Auto-seed mock notifications in dev
  devSeedSuggestions: boolean    // Auto-seed suggestion data in dev
}>
