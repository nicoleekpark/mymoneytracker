import { Platform } from 'react-native'

/**
 * Card shadow style for elevated look
 * Works across iOS (shadow properties) and Android (elevation)
 */
export const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  android: {
    elevation: 6,
  },
  default: {},
})

/**
 * FAB (Floating Action Button) shadow
 * Prominent shadow for floating buttons
 */
export const FAB_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  android: {
    elevation: 8,
  },
  default: {},
})

/**
 * Toast notification shadow
 * Subtle shadow for toast messages
 */
export const TOAST_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
  default: {},
})
