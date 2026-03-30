import type { Notification, NotificationType, SystemNotificationSubtype } from '@/core/domain/notification'

/**
 * Database row representation of a notification.
 * Phase 1: Simplified schema, using existing table structure but ignoring multi-user fields.
 */
export type NotificationRow = {
  id: string
  type: string
  title: string
  message: string
  read: number // 0 or 1
  dismissed: number // 0 or 1
  created_at: string
  read_at: string | null
  // Phase 1: Using sender_id to store subtype (repurposing unused field)
  sender_id: string | null
  // Store metadata as JSON in sender_name field (repurposing)
  sender_name: string | null
  sender_avatar: string | null
}

/**
 * Convert a database row to a domain Notification.
 */
export function rowToNotification(row: NotificationRow): Notification {
  let metadata: Record<string, unknown> | undefined
  if (row.sender_name) {
    try {
      metadata = JSON.parse(row.sender_name)
    } catch {
      // Invalid JSON, ignore
    }
  }

  return {
    id: row.id,
    type: row.type as NotificationType,
    subtype: (row.sender_id as SystemNotificationSubtype) || undefined,
    title: row.title,
    message: row.message,
    createdAt: row.created_at,
    read: row.read === 1,
    dismissed: row.dismissed === 1,
    metadata,
  }
}

/**
 * Convert a domain Notification to a database row.
 */
export function notificationToRow(notification: Notification): NotificationRow {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read ? 1 : 0,
    dismissed: notification.dismissed ? 1 : 0,
    created_at: notification.createdAt,
    read_at: notification.read ? new Date().toISOString() : null,
    sender_id: notification.subtype ?? null,
    sender_name: notification.metadata ? JSON.stringify(notification.metadata) : null,
    sender_avatar: null,
  }
}
