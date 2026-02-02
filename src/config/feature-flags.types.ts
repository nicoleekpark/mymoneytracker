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

  // Developer tools
  devTools: boolean
  devSeedNotifications: boolean  // Auto-seed mock notifications in dev
  devSeedSuggestions: boolean    // Auto-seed suggestion data in dev
}>
