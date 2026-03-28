import { checkDraftReminder, checkBudgetAlert, runAppLaunchTriggers } from '@/core/services/notification'

// Mock dependencies
jest.mock('@/infrastructure/repositories', () => ({
  draftRepository: {
    list: jest.fn(),
  },
  notificationRepository: {
    hasRecentBySubtype: jest.fn(),
    create: jest.fn(),
  },
  transactionRepository: {
    listInDateRange: jest.fn(),
  },
}))

jest.mock('@/shared/store/settings.store', () => ({
  useSettingsStore: {
    getState: jest.fn(),
  },
}))

jest.mock('@/shared/utils/logger', () => ({
  logError: jest.fn(),
}))

import { draftRepository, notificationRepository, transactionRepository } from '@/infrastructure/repositories'
import { useSettingsStore } from '@/shared/store/settings.store'

const mockDraftList = draftRepository.list as jest.MockedFunction<typeof draftRepository.list>
const mockHasRecent = notificationRepository.hasRecentBySubtype as jest.MockedFunction<typeof notificationRepository.hasRecentBySubtype>
const mockCreate = notificationRepository.create as jest.MockedFunction<typeof notificationRepository.create>
const mockListInDateRange = transactionRepository.listInDateRange as jest.MockedFunction<typeof transactionRepository.listInDateRange>
const mockGetState = useSettingsStore.getState as jest.MockedFunction<typeof useSettingsStore.getState>

describe('notification.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkDraftReminder', () => {
    it('does not create notification if recent one exists', () => {
      mockHasRecent.mockReturnValue(true)

      checkDraftReminder()

      expect(mockDraftList).not.toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('does not create notification when no drafts exist', () => {
      mockHasRecent.mockReturnValue(false)
      mockDraftList.mockReturnValue([])

      checkDraftReminder()

      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('creates notification for single draft', () => {
      mockHasRecent.mockReturnValue(false)
      mockDraftList.mockReturnValue([
        { id: 'draft-1', title: 'Test Draft', createdAt: new Date() } as any,
      ])

      checkDraftReminder()

      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        type: 'system',
        subtype: 'draft_reminder',
        title: 'Draft Reminder',
        message: 'You have 1 pending draft',
        metadata: {
          draftCount: 1,
          draftIds: ['draft-1'],
        },
      }))
    })

    it('creates notification for multiple drafts with correct plural message', () => {
      mockHasRecent.mockReturnValue(false)
      mockDraftList.mockReturnValue([
        { id: 'draft-1', title: 'Test 1', createdAt: new Date() } as any,
        { id: 'draft-2', title: 'Test 2', createdAt: new Date() } as any,
        { id: 'draft-3', title: 'Test 3', createdAt: new Date() } as any,
      ])

      checkDraftReminder()

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        message: 'You have 3 pending drafts',
        metadata: {
          draftCount: 3,
          draftIds: ['draft-1', 'draft-2', 'draft-3'],
        },
      }))
    })
  })

  describe('checkBudgetAlert', () => {
    it('does not create notification when budget alerts disabled', () => {
      mockGetState.mockReturnValue({
        budgetAlertEnabled: false,
        monthlyBudget: 500000, // $5000
        budgetAlertThreshold: 80,
      } as any)

      checkBudgetAlert()

      expect(mockListInDateRange).not.toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('does not create notification when no budget set', () => {
      mockGetState.mockReturnValue({
        budgetAlertEnabled: true,
        monthlyBudget: 0,
        budgetAlertThreshold: 80,
      } as any)

      checkBudgetAlert()

      expect(mockListInDateRange).not.toHaveBeenCalled()
    })

    it('does not create notification if recent one exists', () => {
      mockGetState.mockReturnValue({
        budgetAlertEnabled: true,
        monthlyBudget: 500000,
        budgetAlertThreshold: 80,
      } as any)
      mockHasRecent.mockReturnValue(true)

      checkBudgetAlert()

      expect(mockListInDateRange).not.toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('does not create notification when under threshold', () => {
      mockGetState.mockReturnValue({
        budgetAlertEnabled: true,
        monthlyBudget: 500000, // $5000
        budgetAlertThreshold: 80, // 80% = $4000
      } as any)
      mockHasRecent.mockReturnValue(false)
      mockListInDateRange.mockReturnValue({
        items: [
          { type: 'expense', money: { amount: 300000 } }, // $3000
        ],
        hasMore: false,
        oldestDate: null,
      } as any)

      checkBudgetAlert()

      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('creates notification when threshold exceeded', () => {
      mockGetState.mockReturnValue({
        budgetAlertEnabled: true,
        monthlyBudget: 500000, // $5000
        budgetAlertThreshold: 80, // 80% = $4000
      } as any)
      mockHasRecent.mockReturnValue(false)
      mockListInDateRange.mockReturnValue({
        items: [
          { type: 'expense', money: { amount: 250000 } }, // $2500
          { type: 'expense', money: { amount: 200000 } }, // $2000
          { type: 'income', money: { amount: 100000 } }, // $1000 (should be ignored)
        ],
        hasMore: false,
        oldestDate: null,
      } as any)

      checkBudgetAlert()

      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        type: 'system',
        subtype: 'budget_alert',
        title: 'Budget Alert',
        metadata: expect.objectContaining({
          totalExpensesCents: 450000,
          percentUsed: 90,
        }),
      }))
    })
  })

  describe('runAppLaunchTriggers', () => {
    it('calls both check functions', () => {
      mockHasRecent.mockReturnValue(true)
      mockGetState.mockReturnValue({
        budgetAlertEnabled: false,
        monthlyBudget: 0,
        budgetAlertThreshold: 80,
      } as any)

      runAppLaunchTriggers()

      // Both hasRecentBySubtype calls should happen
      expect(mockHasRecent).toHaveBeenCalledWith('draft_reminder', 24)
    })
  })
})
