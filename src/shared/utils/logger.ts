/* eslint-disable no-console -- This is the logger utility, intentionally wraps console */
// ═══════════════════════════════════════════════════════════════════════════
// LOGGER UTILITY
// Centralized logging for the application.
// Replaces raw console.error/warn/log calls with a configurable logger.
// ═══════════════════════════════════════════════════════════════════════════
//
// WHY USE A LOGGER?
// -----------------
// 1. Consistent formatting across the app
// 2. Easy to disable in production
// 3. Future: Send errors to Sentry/Crashlytics
// 4. Categorize errors by severity
//
// USAGE:
// ------
// import { logger } from '@/shared/utils/logger'
//
// logger.error('Failed to save transaction', error)
// logger.warn('Deprecated API called')
// logger.info('User logged in')
// logger.debug('State updated', { newState })
//
// ═══════════════════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogContext = Record<string, unknown>

// ─── Configuration ──────────────────────────────────────────────────────────

const LOG_CONFIG = {
  // In dev mode, show all logs. In prod, only show errors.
  minLevel: __DEV__ ? 'debug' : 'error',

  // Prefix for all log messages
  prefix: '[HoH]',

  // Future: Enable sending errors to external service
  reportToService: false,
} as const

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// ─── Logger Implementation ──────────────────────────────────────────────────

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_CONFIG.minLevel as LogLevel]
}

function formatMessage(level: LogLevel, tag: string, message: string): string {
  const levelUpper = level.toUpperCase().padEnd(5)
  return `${LOG_CONFIG.prefix} [${levelUpper}] ${tag}: ${message}`
}

/**
 * Centralized logger for the application.
 *
 * @example
 * ```typescript
 * // Basic usage
 * logger.error('Database', 'Failed to save', error)
 *
 * // With context
 * logger.warn('API', 'Slow response', { endpoint: '/users', ms: 2500 })
 *
 * // Feature-specific errors
 * logger.error('AddTransaction', 'Save failed', error)
 * ```
 */
export const logger = {
  /**
   * Debug level - verbose logging for development
   * Only shown in __DEV__ mode
   */
  debug(tag: string, message: string, context?: LogContext): void {
    if (!shouldLog('debug')) return
    console.log(formatMessage('debug', tag, message), context ?? '')
  },

  /**
   * Info level - general information
   * Only shown in __DEV__ mode
   */
  info(tag: string, message: string, context?: LogContext): void {
    if (!shouldLog('info')) return
    console.info(formatMessage('info', tag, message), context ?? '')
  },

  /**
   * Warn level - potential issues that don't break functionality
   */
  warn(tag: string, message: string, context?: LogContext): void {
    if (!shouldLog('warn')) return
    console.warn(formatMessage('warn', tag, message), context ?? '')
  },

  /**
   * Error level - something went wrong
   * Always shown, even in production
   *
   * @param tag - Feature/module name (e.g., 'Database', 'AddTransaction')
   * @param message - Human-readable error description
   * @param error - The caught error object (optional)
   */
  error(tag: string, message: string, error?: unknown): void {
    if (!shouldLog('error')) return

    const formattedMsg = formatMessage('error', tag, message)

    if (error instanceof Error) {
      console.error(formattedMsg, {
        message: error.message,
        stack: error.stack,
      })
    } else if (error !== undefined) {
      console.error(formattedMsg, error)
    } else {
      console.error(formattedMsg)
    }

    // Future: Send to error reporting service
    // if (LOG_CONFIG.reportToService && !__DEV__) {
    //   Sentry.captureException(error)
    // }
  },
}

// ─── Convenience Exports ────────────────────────────────────────────────────

/**
 * Quick error logger for catch blocks.
 * Extracts message from Error objects automatically.
 *
 * @example
 * ```typescript
 * try {
 *   await saveTransaction()
 * } catch (e) {
 *   logError('SaveTransaction', e)
 * }
 * ```
 */
export function logError(tag: string, error: unknown): void {
  const message = error instanceof Error ? error.message : 'Unknown error'
  logger.error(tag, message, error)
}
