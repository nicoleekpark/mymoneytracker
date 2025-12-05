import { type ReactNode, createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

import { useThemeStore } from './store';
import { ThemeMode, THEMES } from './theme';


export const HoHThemeContext = createContext(THEMES.light)
export const useHoHTheme = () => useContext(HoHThemeContext)

type HoHThemeProviderProps = {
  children: ReactNode
  initialMode?: ThemeMode
}

export const HoHThemeProvider = ({ children, initialMode }: HoHThemeProviderProps) => {
  const systemThemeMode = useColorScheme() as ThemeMode
  const userThemeMode = useThemeStore(t => t.mode)

  const themeMode = userThemeMode ?? initialMode ?? systemThemeMode ?? 'light'
  const theme = THEMES[themeMode]

  return (
    <HoHThemeContext.Provider value={theme}>
      {children}
    </HoHThemeContext.Provider>
    )
}