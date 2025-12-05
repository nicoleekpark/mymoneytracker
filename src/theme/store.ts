import { create } from 'zustand'
import { ThemeMode } from './theme'

type ThemeState = {
  mode: ThemeMode,
  setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: null, // null follows system theme
  setMode: (mode) => set({ mode })
}))