/**
 * Toast Component & Hook
 *
 * Simple toast notification system.
 * Usage: const { showToast, ToastContainer } = useToast()
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'

const TOAST_DURATION = 1500

type ToastContextType = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [key, setKey] = useState(0)
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    // Clear any existing timeout to prevent stale updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setMessage(msg)
    setKey((k) => k + 1)
    timeoutRef.current = setTimeout(() => setMessage(null), TOAST_DURATION)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <Animated.View
          key={key}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.container,
            {
              bottom: insets.bottom + spacing.xl,
              backgroundColor: theme.semantic.text,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.message, { color: theme.semantic.surface }]}>
            {message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
})
