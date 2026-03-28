import type { ReactNode } from 'react'
import React, { createContext, useContext, useMemo } from 'react'
import { useColorScheme } from 'react-native'

import { useThemeStore } from '@/shared/store'
import type { Theme, ThemeMode } from '@/shared/theme'
import { THEMES } from '@/shared/theme'

export const HoHThemeContext = createContext<Theme | null>(null)

export const useHoHTheme = () => {
  const ctx = useContext(HoHThemeContext)
  if (!ctx) throw new Error('useHoHTheme must be used within HoHThemeProvider')
  return ctx
}

type Props = {
  children: ReactNode
  // fallback only, used when user mode is null and system is unavailable
  initialMode?: ThemeMode
}

export const HoHThemeProvider = ({ children, initialMode }: Props) => {
  const systemMode = (useColorScheme() as ThemeMode | null) ?? null
  const userMode = useThemeStore((t) => t.mode)

  // TODO const effectiveMode: ThemeMode = userMode ?? systemMode ?? initialMode ?? 'dark' is correct
  // const effectiveMode: ThemeMode = userMode ?? systemMode ?? initialMode ?? 'dark'
  const effectiveMode: ThemeMode = userMode ?? initialMode ?? systemMode ?? 'dark'

  const theme = useMemo(() => THEMES[effectiveMode], [effectiveMode])

  return <HoHThemeContext.Provider value={theme}>{children}</HoHThemeContext.Provider>
}
