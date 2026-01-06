import type { FeatureFlags } from '@/types'

export const FEATURE_FLAGS: FeatureFlags = {
  devTools: process.env.EXPO_PUBLIC_DEV_TOOLS === 'true',
  familySharing: false,
  bankConnection: false,
  bankSync: false,
  receiptCapture: false,
  notifications: false,
  widget: false
} as const
