export { APP_CONFIG } from './app.config'
export type { AppConfig } from './app.config.types'

export { CURRENCIES } from './currencies.config'
export type { Currency, CurrencyCode, CurrencySymbol } from './currencies.types'

export { FEATURE_FLAGS } from './feature-flags.config'
export type { FeatureFlags, HeroVariant } from './feature-flags.types'

export { CATEGORIES } from './categories.config'
export { type CategoryIndex, CATEGORIES_INDEX } from './categories.index'

export {
  PREMADE_TAGS,
  OCCURRENCE_TAGS,
  SYSTEM_TAGS,
  getTagConfig,
  getTagsByCategory,
} from './tags.config'
export type { TagCategory, TagConfig } from './tags.config'