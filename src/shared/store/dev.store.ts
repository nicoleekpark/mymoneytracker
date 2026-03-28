/**
 * Dev Store
 *
 * Manages dev tools visibility state.
 * Allows toggling dev tools on/off dynamically.
 *
 * Toggle methods:
 * - Long-press on AppBar logo (HoH) - 500ms
 * - Programmatic via toggleDevTools()
 *
 * Note: State resets on app restart (no persistence).
 * This is intentional - dev tools should default to visible in dev builds.
 */

import { create } from 'zustand'

type DevState = {
  /** Whether dev tools overlay is visible */
  devToolsVisible: boolean

  /** Toggle dev tools visibility */
  toggleDevTools: () => void

  /** Explicitly set visibility */
  setDevToolsVisible: (visible: boolean) => void
}

export const useDevStore = create<DevState>((set) => ({
  // Default to true in dev mode, false in production
  devToolsVisible: __DEV__,

  toggleDevTools: () => set((s) => ({ devToolsVisible: !s.devToolsVisible })),

  setDevToolsVisible: (visible) => set({ devToolsVisible: visible }),
}))
