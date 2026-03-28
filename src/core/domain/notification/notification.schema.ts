// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN SCHEMA: Notification
// Zod schemas for runtime validation at system boundaries (DB, API, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─── Enum Schemas ───────────────────────────────────────────────────────────

export const NotificationTypeSchema = z.enum(['system'])

export const SystemNotificationSubtypeSchema = z.enum([
  'draft_reminder',
  'budget_alert',
  'inactivity_nudge',
  'anomaly_detected',
])

export const NotificationTabSchema = z.enum(['all', 'unread'])

export const TimeGroupSchema = z.enum(['today', 'yesterday', 'last7days', 'last30days', 'older'])

// ─── Parse Functions ────────────────────────────────────────────────────────

/**
 * Parse and validate notification type from unknown input.
 * Returns validated value or falls back to 'system'.
 */
export function parseNotificationType(value: unknown): z.infer<typeof NotificationTypeSchema> {
  const result = NotificationTypeSchema.safeParse(value)
  if (result.success) return result.data
  return 'system' // Safe fallback
}

/**
 * Parse and validate system notification subtype from unknown input.
 * Returns validated value or undefined if invalid.
 */
export function parseSystemNotificationSubtype(value: unknown): z.infer<typeof SystemNotificationSubtypeSchema> | undefined {
  const result = SystemNotificationSubtypeSchema.safeParse(value)
  if (result.success) return result.data
  return undefined // No fallback - subtype is optional
}

/**
 * Parse and validate notification tab from unknown input.
 * Returns validated value or falls back to 'all'.
 */
export function parseNotificationTab(value: unknown): z.infer<typeof NotificationTabSchema> {
  const result = NotificationTabSchema.safeParse(value)
  if (result.success) return result.data
  return 'all' // Safe fallback
}

/**
 * Parse and validate time group from unknown input.
 * Returns validated value or falls back to 'older'.
 */
export function parseTimeGroup(value: unknown): z.infer<typeof TimeGroupSchema> {
  const result = TimeGroupSchema.safeParse(value)
  if (result.success) return result.data
  return 'older' // Safe fallback
}
