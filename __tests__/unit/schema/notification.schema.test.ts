import {
  NotificationTypeSchema,
  SystemNotificationSubtypeSchema,
  NotificationTabSchema,
  TimeGroupSchema,
  parseNotificationType,
  parseSystemNotificationSubtype,
  parseNotificationTab,
  parseTimeGroup,
} from '@/core/domain/notification/notification.schema'

describe('notification.schema', () => {
  describe('NotificationTypeSchema', () => {
    it('accepts valid notification types', () => {
      expect(NotificationTypeSchema.safeParse('system').success).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(NotificationTypeSchema.safeParse('user').success).toBe(false)
      expect(NotificationTypeSchema.safeParse('').success).toBe(false)
    })
  })

  describe('SystemNotificationSubtypeSchema', () => {
    it('accepts valid subtypes', () => {
      expect(SystemNotificationSubtypeSchema.safeParse('draft_reminder').success).toBe(true)
      expect(SystemNotificationSubtypeSchema.safeParse('budget_alert').success).toBe(true)
      expect(SystemNotificationSubtypeSchema.safeParse('inactivity_nudge').success).toBe(true)
      expect(SystemNotificationSubtypeSchema.safeParse('anomaly_detected').success).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(SystemNotificationSubtypeSchema.safeParse('unknown').success).toBe(false)
    })
  })

  describe('parseNotificationType', () => {
    it('returns valid value unchanged', () => {
      expect(parseNotificationType('system')).toBe('system')
    })

    it('returns fallback for invalid value', () => {
      expect(parseNotificationType('user')).toBe('system')
      expect(parseNotificationType(null)).toBe('system')
    })
  })

  describe('parseSystemNotificationSubtype', () => {
    it('returns valid value unchanged', () => {
      expect(parseSystemNotificationSubtype('draft_reminder')).toBe('draft_reminder')
      expect(parseSystemNotificationSubtype('budget_alert')).toBe('budget_alert')
    })

    it('returns undefined for invalid value', () => {
      expect(parseSystemNotificationSubtype('unknown')).toBeUndefined()
      expect(parseSystemNotificationSubtype(null)).toBeUndefined()
    })
  })

  describe('parseNotificationTab', () => {
    it('returns valid value unchanged', () => {
      expect(parseNotificationTab('all')).toBe('all')
      expect(parseNotificationTab('unread')).toBe('unread')
    })

    it('returns fallback for invalid value', () => {
      expect(parseNotificationTab('read')).toBe('all')
      expect(parseNotificationTab(null)).toBe('all')
    })
  })

  describe('parseTimeGroup', () => {
    it('returns valid value unchanged', () => {
      expect(parseTimeGroup('today')).toBe('today')
      expect(parseTimeGroup('yesterday')).toBe('yesterday')
      expect(parseTimeGroup('last7days')).toBe('last7days')
      expect(parseTimeGroup('last30days')).toBe('last30days')
      expect(parseTimeGroup('older')).toBe('older')
    })

    it('returns fallback for invalid value', () => {
      expect(parseTimeGroup('thisweek')).toBe('older')
      expect(parseTimeGroup(null)).toBe('older')
    })
  })
})
