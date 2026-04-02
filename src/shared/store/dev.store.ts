/**
 * Dev Store
 *
 * @persistence IN-MEMORY - Not persisted, intentionally resets on restart.
 * @scope SESSION - Dev tools visibility within current session.
 *
 * Manages dev tools visibility state.
 * Toggle: Long-press AppBar logo (500ms) or programmatic toggleDevTools().
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
