/**
 * Notification Fixtures
 *
 * Applies/deletes mock notifications from seed_notifications.json
 * Used by DevToolsOverlay for testing notification flows.
 */

import { exec, queryFirst, withTransaction } from '../../sqlite'
import type { SeedReport } from '../seed.report'
import seedNotifications from '../data/seed_notifications.json'

type NotificationFixture = {
  key: string
  type: string
  title: string
  message: string
  read: boolean
  hoursAgo: number
  senderName?: string
  senderAvatar?: string
  groupName?: string
  reactionType?: string
}

type NotificationRow = {
  id: string
}

function getByKey(key: string): NotificationRow | null {
  return queryFirst<NotificationRow>(
    `SELECT id FROM notifications WHERE id = ? LIMIT 1;`,
    [key]
  )
}

/**
 * Apply notification fixtures from JSON
 */
export function applyFixtureNotifications(report: SeedReport): void {
  const now = Date.now()
  const notifications = seedNotifications.notifications as NotificationFixture[]

  withTransaction(() => {
    for (const notif of notifications) {
      const existing = getByKey(notif.key)
      if (existing) {
        report.notifications.skipped++
        continue
      }

      const createdAt = new Date(now - notif.hoursAgo * 60 * 60 * 1000).toISOString()

      exec(
        `
        INSERT INTO notifications (
          id, type, title, message, read, created_at,
          sender_name, sender_avatar, group_name, reaction_type, is_system
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
        `,
        [
          notif.key,
          notif.type,
          notif.title,
          notif.message,
          notif.read ? 1 : 0,
          createdAt,
          notif.senderName ?? null,
          notif.senderAvatar ?? null,
          notif.groupName ?? null,
          notif.reactionType ?? null,
        ]
      )

      report.notifications.inserted++
    }
  })
}

/**
 * Delete notification fixtures
 */
export function deleteFixtureNotifications(report: SeedReport): void {
  const notifications = seedNotifications.notifications as NotificationFixture[]

  withTransaction(() => {
    for (const notif of notifications) {
      const existing = getByKey(notif.key)
      if (!existing) {
        report.notifications.skipped++
        continue
      }

      exec(`DELETE FROM notifications WHERE id = ?;`, [notif.key])
      report.notifications.deleted++
    }
  })
}

/**
 * Standalone: Seed notifications and return count
 */
export function seedNotificationsStandalone(): number {
  const now = Date.now()
  const notifications = seedNotifications.notifications as NotificationFixture[]
  let inserted = 0

  withTransaction(() => {
    for (const notif of notifications) {
      const existing = getByKey(notif.key)
      if (existing) continue

      const createdAt = new Date(now - notif.hoursAgo * 60 * 60 * 1000).toISOString()

      exec(
        `INSERT INTO notifications (id, type, title, message, read, created_at, sender_name, sender_avatar, group_name, reaction_type, is_system)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
        [notif.key, notif.type, notif.title, notif.message, notif.read ? 1 : 0, createdAt,
         notif.senderName ?? null, notif.senderAvatar ?? null, notif.groupName ?? null, notif.reactionType ?? null]
      )
      inserted++
    }
  })

  return inserted
}

/**
 * Standalone: Clear notifications and return count
 */
export function clearNotificationsStandalone(): number {
  const countRow = queryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM notifications WHERE is_system = 1;`
  )
  const count = countRow?.count ?? 0
  exec(`DELETE FROM notifications WHERE is_system = 1;`)
  return count
}

/**
 * Toggle read status for all fixture notifications
 */
export function toggleFixtureNotificationsRead(setRead: boolean): number {
  const countRow = queryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM notifications WHERE is_system = 1;`
  )
  const count = countRow?.count ?? 0
  exec(
    `UPDATE notifications SET read = ?, read_at = ? WHERE is_system = 1;`,
    [setRead ? 1 : 0, setRead ? new Date().toISOString() : null]
  )
  return count
}

/**
 * Create a single mock notification (for testing "new" notification)
 */
export function createMockNotification(type: 'system' | 'user_action' | 'message' | 'reaction' | 'group'): string {
  const id = `mock:${Date.now()}`
  const now = new Date().toISOString()

  const templates: Record<string, { title: string; message: string; senderName?: string; senderAvatar?: string; groupName?: string; reactionType?: string }> = {
    system: {
      title: 'System',
      message: 'New system update available',
    },
    user_action: {
      title: 'Nicole',
      message: `Added "Test expense" – $${(Math.random() * 100).toFixed(2)}`,
      senderName: 'Nicole',
      senderAvatar: 'N',
    },
    message: {
      title: 'Drake',
      message: 'Hey, did you see the new expense?',
      senderName: 'Drake',
      senderAvatar: 'D',
    },
    reaction: {
      title: 'Nicole',
      message: '👍 liked your expense',
      senderName: 'Nicole',
      senderAvatar: 'N',
      reactionType: 'like',
    },
    group: {
      title: 'Family',
      message: 'New expense added to shared budget',
      groupName: 'Family',
    },
  }

  const template = templates[type]

  exec(
    `
    INSERT INTO notifications (
      id, type, title, message, read, created_at,
      sender_name, sender_avatar, group_name, reaction_type, is_system
    )
    VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 0);
    `,
    [
      id,
      type,
      template.title,
      template.message,
      now,
      template.senderName ?? null,
      template.senderAvatar ?? null,
      template.groupName ?? null,
      template.reactionType ?? null,
    ]
  )

  return id
}

/**
 * Get notification statistics
 */
export function getNotificationStats(): {
  total: number
  unread: number
  byType: Record<string, number>
} {
  const total = queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM notifications;`)
  const unread = queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM notifications WHERE read = 0;`)

  // Query by type
  const types = ['system', 'user_action', 'message', 'reaction', 'group']
  const byType: Record<string, number> = {}

  for (const t of types) {
    const row = queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM notifications WHERE type = ?;`,
      [t]
    )
    byType[t] = row?.count ?? 0
  }

  return {
    total: total?.count ?? 0,
    unread: unread?.count ?? 0,
    byType,
  }
}
