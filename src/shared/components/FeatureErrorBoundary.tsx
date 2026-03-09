import React, { Component, type ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useHoHTheme } from '@/providers'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { spacing } from '@/theme/tokens/spacing'
import { radius } from '@/theme/tokens/radius'

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
  featureName?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Error boundary for feature components.
 * Catches rendering errors and displays a recovery UI.
 *
 * Usage:
 * ```tsx
 * <FeatureErrorBoundary featureName="Monthly View">
 *   <MonthlyBody ... />
 * </FeatureErrorBoundary>
 * ```
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.featureName || 'Feature'} error:`, error)
    console.error('Component stack:', errorInfo.componentStack)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          featureName={this.props.featureName}
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default error fallback UI
 */
function ErrorFallback({
  featureName,
  error,
  onRetry
}: {
  featureName?: string
  error: Error | null
  onRetry: () => void
}) {
  const theme = useHoHTheme()

  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl
    }}>
      <Text style={{
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: theme.semantic.text,
        marginBottom: spacing.sm,
        textAlign: 'center'
      }}>
        Something went wrong
      </Text>

      {featureName && (
        <Text style={{
          fontSize: fontSize.sm,
          color: theme.semantic.textSecondary,
          marginBottom: spacing.md,
          textAlign: 'center'
        }}>
          {featureName} couldn't load properly.
        </Text>
      )}

      {__DEV__ && error && (
        <Text style={{
          fontSize: fontSize.xs,
          color: theme.semantic.danger,
          marginBottom: spacing.lg,
          textAlign: 'center',
          fontFamily: 'monospace'
        }}>
          {error.message}
        </Text>
      )}

      <Pressable
        onPress={onRetry}
        style={({ pressed }) => ({
          backgroundColor: theme.semantic.primary,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.xl,
          borderRadius: radius.md,
          opacity: pressed ? 0.7 : 1
        })}
      >
        <Text style={{
          fontSize: fontSize.sm,
          fontWeight: fontWeight.semibold,
          color: '#fff'
        }}>
          Try Again
        </Text>
      </Pressable>
    </View>
  )
}

export const FeatureErrorBoundary = ErrorBoundaryClass
