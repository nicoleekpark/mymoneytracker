import { type ReactNode, createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useThemeStore } from '@/store';
import { THEMES, Theme, ThemeMode } from '@/theme';


export const HoHThemeContext = createContext<Theme | null>(null)
export const useHoHTheme = () => {
  const ctx = useContext(HoHThemeContext);
  if (!ctx) {
    throw new Error('useHoHTheme must be used within HoHThemeProvider')
  }
  return ctx;
};

type Props = {
  children: ReactNode
  initialMode?: ThemeMode
}

export const HoHThemeProvider = ({ children, initialMode }: Props) => {
  const systemThemeMode = useColorScheme() as ThemeMode
  const userThemeMode = useThemeStore(t => t.mode)

  const themeMode = userThemeMode ?? initialMode ?? systemThemeMode ?? 'light'
  const theme = THEMES[themeMode]

  const value = useMemo(() => theme, [themeMode]);

  return (
    <HoHThemeContext.Provider value={value}>
      {children}
    </HoHThemeContext.Provider>
    )
}