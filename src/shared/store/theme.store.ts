/**
 * Theme Store
 *
 * @persistence IN-MEMORY - Not persisted, resets on app restart.
 * @scope SESSION - Follows system theme by default.
 *
 * Manages light/dark mode preference.
 */

import type { ThemeMode } from '@/shared/theme'
import { create } from 'zustand'

type ThemeState = {
  mode: ThemeMode | null
  setMode: (mode: ThemeMode | null) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: null,
  setMode: (mode) => set({ mode })
}))
