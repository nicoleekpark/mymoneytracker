import {
  rowToNotification,
  notificationToRow,
  type NotificationRow,
} from '@/infrastructure/mappers/notification.mapper'
import type { Notification } from '@/core/domain/notification'

describe('notification.mapper', () => {
  describe('rowToNotification', () => {
    it('converts a complete row to domain notification', () => {
      const row: NotificationRow = {
        id: 'notif-1',
        type: 'system',
        title: 'Budget Alert',
        message: 'You have exceeded your food budget',
        read: 1,
        dismissed: 0,
        created_at: '2024-03-15T10:00:00.000Z',
        read_at: '2024-03-15T11:00:00.000Z',
        sender_id: 'budget_alert',
        sender_name: '{"categoryId":"food-groceries","overage":1500}',
        sender_avatar: null,
      }

      const notification = rowToNotification(row)

      expect(notification.id).toBe('notif-1')
      expect(notification.type).toBe('system')
      expect(notification.subtype).toBe('budget_alert')
      expect(notification.title).toBe('Budget Alert')
      expect(notification.message).toBe('You have exceeded your food budget')
      expect(notification.read).toBe(true)
      expect(notification.dismissed).toBe(false)
      expect(notification.createdAt).toBe('2024-03-15T10:00:00.000Z')
      expect(notification.metadata).toEqual({ categoryId: 'food-groceries', overage: 1500 })
    })

    it('handles unread notification', () => {
      const row: NotificationRow = {
        id: 'notif-2',
        type: 'system',
        title: 'Review Drafts',
        message: 'You have 3 pending drafts',
        read: 0,
        dismissed: 0,
        created_at: '2024-03-15T10:00:00.000Z',
        read_at: null,
        sender_id: 'draft_reminder',
        sender_name: null,
        sender_avatar: null,
      }

      const notification = rowToNotification(row)

      expect(notification.read).toBe(false)
      expect(notification.dismissed).toBe(false)
      expect(notification.metadata).toBeUndefined()
    })

    it('handles dismissed notification', () => {
      const row: NotificationRow = {
        id: 'notif-3',
        type: 'system',
        title: 'Dismissed Alert',
        message: 'This was dismissed',
        read: 1,
        dismissed: 1,
        created_at: '2024-03-15T10:00:00.000Z',
        read_at: '2024-03-15T11:00:00.000Z',
        sender_id: null,
        sender_name: null,
        sender_avatar: null,
      }

      const notification = rowToNotification(row)

      expect(notification.dismissed).toBe(true)
      expect(notification.subtype).toBeUndefined()
    })

    it('handles invalid JSON in metadata', () => {
      const row: NotificationRow = {
        id: 'notif-4',
        type: 'system',
        title: 'Test',
        message: 'Test message',
        read: 0,
        dismissed: 0,
        created_at: '2024-03-15T10:00:00.000Z',
        read_at: null,
        sender_id: null,
        sender_name: 'invalid-json',
        sender_avatar: null,
      }

      const notification = rowToNotification(row)

      expect(notification.metadata).toBeUndefined()
    })

    it('handles null sender_id (no subtype)', () => {
      const row: NotificationRow = {
        id: 'notif-5',
        type: 'system',
        title: 'Generic Alert',
        message: 'Something happened',
        read: 0,
        dismissed: 0,
        created_at: '2024-03-15T10:00:00.000Z',
        read_at: null,
        sender_id: null,
        sender_name: null,
        sender_avatar: null,
      }

      const notification = rowToNotification(row)

      expect(notification.subtype).toBeUndefined()
    })
  })

  describe('notificationToRow', () => {
    it('converts a complete notification to row', () => {
      const notification: Notification = {
        id: 'notif-1',
        type: 'system',
        subtype: 'budget_alert',
        title: 'Budget Alert',
        message: 'You have exceeded your budget',
        createdAt: '2024-03-15T10:00:00.000Z',
        read: true,
        dismissed: false,
        metadata: { categoryId: 'food', overage: 500 },
      }

      const row = notificationToRow(notification)

      expect(row.id).toBe('notif-1')
      expect(row.type).toBe('system')
      expect(row.title).toBe('Budget Alert')
      expect(row.message).toBe('You have exceeded your budget')
      expect(row.read).toBe(1)
      expect(row.created_at).toBe('2024-03-15T10:00:00.000Z')
      expect(row.read_at).toBeDefined() // Should be set when read is true
      expect(row.sender_id).toBe('budget_alert')
      expect(row.sender_name).toBe('{"categoryId":"food","overage":500}')
      expect(row.sender_avatar).toBeNull()
    })

    it('converts unread notification to row', () => {
      const notification: Notification = {
        id: 'notif-2',
        type: 'system',
        title: 'Review Drafts',
        message: 'You have pending drafts',
        createdAt: '2024-03-15T10:00:00.000Z',
        read: false,
        dismissed: false,
      }

      const row = notificationToRow(notification)

      expect(row.read).toBe(0)
      expect(row.read_at).toBeNull()
      expect(row.sender_id).toBeNull()
      expect(row.sender_name).toBeNull()
    })

    it('converts dismissed notification to row', () => {
      const notification: Notification = {
        id: 'notif-3',
        type: 'system',
        title: 'Dismissed',
        message: 'Was dismissed',
        createdAt: '2024-03-15T10:00:00.000Z',
        read: true,
        dismissed: true,
      }

      const row = notificationToRow(notification)

      expect(row.dismissed).toBe(1)
      expect(row.sender_avatar).toBeNull()
    })

    it('handles notification without optional fields', () => {
      const notification: Notification = {
        id: 'notif-4',
        type: 'system',
        title: 'Simple',
        message: 'Simple message',
        createdAt: '2024-03-15T10:00:00.000Z',
        read: false,
        dismissed: false,
      }

      const row = notificationToRow(notification)

      expect(row.sender_id).toBeNull()
      expect(row.sender_name).toBeNull()
      expect(row.sender_avatar).toBeNull()
    })
  })

  describe('roundtrip conversion', () => {
    it('preserves data through row -> notification -> row conversion', () => {
      const originalRow: NotificationRow = {
        id: 'notif-roundtrip',
        type: 'system',
        title: 'Roundtrip Test',
        message: 'Testing roundtrip conversion',
        read: 0,
        dismissed: 0,
        created_at: '2024-03-15T10:00:00.000Z',
        read_at: null,
        sender_id: 'test_subtype',
        sender_name: '{"key":"value"}',
        sender_avatar: null,
      }

      const notification = rowToNotification(originalRow)
      const convertedRow = notificationToRow(notification)

      expect(convertedRow.id).toBe(originalRow.id)
      expect(convertedRow.type).toBe(originalRow.type)
      expect(convertedRow.title).toBe(originalRow.title)
      expect(convertedRow.message).toBe(originalRow.message)
      expect(convertedRow.read).toBe(originalRow.read)
      expect(convertedRow.created_at).toBe(originalRow.created_at)
      expect(convertedRow.sender_id).toBe(originalRow.sender_id)
      expect(JSON.parse(convertedRow.sender_name!)).toEqual(JSON.parse(originalRow.sender_name!))
    })
  })
})
