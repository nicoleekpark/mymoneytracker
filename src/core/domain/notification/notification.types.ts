/**
 * Notification Types
 *
 * Phase 1: System notifications only (single-user)
 * Phase 2: Will add user_action, message, reaction, group for multi-user
 */

// Phase 1: System-only types
export type NotificationType = 'system'

// System notification subtypes for Phase 1
export type SystemNotificationSubtype =
  | 'draft_reminder'    // Drafts older than 7 days
  | 'budget_alert'      // Budget threshold exceeded
  | 'inactivity_nudge'  // No transactions for X days
  | 'anomaly_detected'  // Unusual spending pattern

export type Notification = {
  id: string
  type: NotificationType
  subtype?: SystemNotificationSubtype
  title: string
  message: string
  createdAt: string // ISO date
  read: boolean
  dismissed: boolean

  // Optional metadata
  metadata?: Record<string, unknown>
}

// Simplified tabs for Phase 1
export type NotificationTab = 'all' | 'unread' | 'drafts'

/**
 * Tab configuration - Phase 1 (simplified)
 */
export const NOTIFICATION_TABS: { key: NotificationTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'drafts', label: 'Drafts' },
]

/**
 * Time group labels for notification list
 */
export type TimeGroup = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'older'

export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7days: 'Last 7 Days',
  last30days: 'Last 30 Days',
  older: 'Older',
}

/**
 * Input for creating a notification
 */
export type CreateNotificationInput = Omit<Notification, 'id' | 'createdAt' | 'read' | 'dismissed'>
