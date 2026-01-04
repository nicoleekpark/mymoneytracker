import { defaultConfig } from '@tamagui/config/v4'
import { createTamagui } from 'tamagui'

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  media: {
    ...defaultConfig.media
  }
})

type Config = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Config {}
}

export default tamaguiConfig
