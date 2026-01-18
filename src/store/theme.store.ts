import type { ThemeMode } from '@/theme'
import { create } from 'zustand'

type ThemeState = {
  mode: ThemeMode | null
  setMode: (mode: ThemeMode | null) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: null,
  setMode: (mode) => set({ mode })
}))
