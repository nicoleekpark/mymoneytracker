import type { Notification, CreateNotificationInput } from '@/core/domain/notification'
import type { DataSource } from '../db/DataSource'
import {
  rowToNotification,
  notificationToRow,
  type NotificationRow,
} from '../mappers/notification.mapper'

/**
 * Generate a unique ID for notifications
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * SQLite implementation of NotificationRepository.
 * Phase 1: System notifications only.
 */
export class SqliteNotificationRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * List all non-dismissed notifications, newest first.
   */
  list(): Notification[] {
    const rows = this.dataSource.queryAll<NotificationRow>(
      `SELECT id, type, title, message, read, created_at, read_at,
              sender_id, sender_name, sender_avatar
       FROM notifications
       WHERE sender_avatar IS NULL OR sender_avatar != '1'
       ORDER BY created_at DESC;`
    )
    return rows.map(rowToNotification)
  }

  /**
   * List unread notifications only.
   */
  listUnread(): Notification[] {
    const rows = this.dataSource.queryAll<NotificationRow>(
      `SELECT id, type, title, message, read, created_at, read_at,
              sender_id, sender_name, sender_avatar
       FROM notifications
       WHERE read = 0 AND (sender_avatar IS NULL OR sender_avatar != '1')
       ORDER BY created_at DESC;`
    )
    return rows.map(rowToNotification)
  }

  /**
   * Get a single notification by ID.
   */
  getById(id: string): Notification | null {
    const row = this.dataSource.queryFirst<NotificationRow>(
      `SELECT id, type, title, message, read, created_at, read_at,
              sender_id, sender_name, sender_avatar
       FROM notifications WHERE id = ? LIMIT 1;`,
      [id]
    )
    return row ? rowToNotification(row) : null
  }

  /**
   * Create a new notification.
   */
  create(input: CreateNotificationInput): Notification {
    const notification: Notification = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
      read: false,
      dismissed: false,
    }

    const row = notificationToRow(notification)
    this.dataSource.exec(
      `INSERT INTO notifications (
        id, type, title, message, read, created_at, read_at,
        sender_id, sender_name, sender_avatar
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        row.id,
        row.type,
        row.title,
        row.message,
        row.read,
        row.created_at,
        row.read_at,
        row.sender_id,
        row.sender_name,
        row.sender_avatar,
      ]
    )

    return notification
  }

  /**
   * Mark a notification as read.
   */
  markAsRead(id: string): void {
    this.dataSource.exec(
      `UPDATE notifications SET read = 1, read_at = ? WHERE id = ?;`,
      [new Date().toISOString(), id]
    )
  }

  /**
   * Mark all notifications as read.
   */
  markAllAsRead(): void {
    this.dataSource.exec(
      `UPDATE notifications SET read = 1, read_at = ? WHERE read = 0;`,
      [new Date().toISOString()]
    )
  }

  /**
   * Dismiss a notification (soft delete).
   */
  dismiss(id: string): void {
    this.dataSource.exec(
      `UPDATE notifications SET sender_avatar = '1' WHERE id = ?;`,
      [id]
    )
  }

  /**
   * Delete a notification permanently.
   */
  delete(id: string): void {
    this.dataSource.exec(`DELETE FROM notifications WHERE id = ?;`, [id])
  }

  /**
   * Get count of unread notifications.
   */
  getUnreadCount(): number {
    const result = this.dataSource.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM notifications
       WHERE read = 0 AND (sender_avatar IS NULL OR sender_avatar != '1');`
    )
    return result?.count ?? 0
  }

  /**
   * Check if a notification with given subtype exists and is recent (within hours).
   * Used to prevent duplicate notifications.
   */
  hasRecentBySubtype(subtype: string, withinHours: number = 24): boolean {
    const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1000).toISOString()
    const result = this.dataSource.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM notifications
       WHERE sender_id = ? AND created_at > ?
       AND (sender_avatar IS NULL OR sender_avatar != '1');`,
      [subtype, cutoff]
    )
    return (result?.count ?? 0) > 0
  }

  /**
   * Clear all notifications (for dev/testing).
   */
  clearAll(): void {
    this.dataSource.exec(`DELETE FROM notifications;`)
  }
}
