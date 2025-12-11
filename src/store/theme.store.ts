import { ThemeMode } from '@/theme'
import { create } from 'zustand'

type ThemeState = {
  mode: ThemeMode,
  setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: null, // null follows system theme
  setMode: (mode) => set({ mode })
}))