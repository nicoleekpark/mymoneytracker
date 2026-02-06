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
