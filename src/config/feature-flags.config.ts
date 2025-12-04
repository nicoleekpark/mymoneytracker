import type { FeatureFlags } from '@/types'

export const FEATURE_FLAGS: FeatureFlags = {
  familySharing: false,
  bankConnection: false,
  bankSync: false,
  receiptCapture: false,
  notifications: false,
  widget: false
} as const
