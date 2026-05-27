import { useDraftsStore, type DraftTransaction } from '@/shared/store/drafts.store'

// Mock dependencies
jest.mock('@/infrastructure/repositories', () => ({
  draftRepository: {
    list: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggleStar: jest.fn(),
    clearAll: jest.fn(),
  },
}))

jest.mock('@/shared/utils/logger', () => ({
  logError: jest.fn(),
}))

jest.mock('@/shared/utils/uuid', () => ({
  uuid: jest.fn(() => 'mock-draft-uuid'),
}))

import { draftRepository } from '@/infrastructure/repositories'
import { logError } from '@/shared/utils/logger'
import { uuid } from '@/shared/utils/uuid'

const mockList = draftRepository.list as jest.MockedFunction<typeof draftRepository.list>
const mockInsert = draftRepository.insert as jest.MockedFunction<typeof draftRepository.insert>
const mockUpdate = draftRepository.update as jest.MockedFunction<typeof draftRepository.update>
const mockDelete = draftRepository.delete as jest.MockedFunction<typeof draftRepository.delete>
const mockToggleStar = draftRepository.toggleStar as jest.MockedFunction<
  typeof draftRepository.toggleStar
>
const mockClearAll = draftRepository.clearAll as jest.MockedFunction<typeof draftRepository.clearAll>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockUuid = uuid as jest.MockedFunction<typeof uuid>

const createMockDraft = (overrides: Partial<DraftTransaction> = {}): DraftTransaction => ({
  id: 'draft-1',
  type: 'expense',
  item: 'Test Item',
  amountCents: 1500,
  occurredAt: '2024-06-15T12:00:00.000Z',
  createdAt: '2024-06-15T10:00:00.000Z',
  starred: false,
  ...overrides,
})

describe('drafts.store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    useDraftsStore.setState({ drafts: [], isLoaded: false })
    mockUuid.mockReturnValue('mock-draft-uuid')
  })

  describe('loadDrafts', () => {
    it('loads drafts from repository', () => {
      const dbDrafts = [
        createMockDraft({ id: 'draft-1', starred: true }),
        createMockDraft({ id: 'draft-2', starred: false }),
      ]
      mockList.mockReturnValue(dbDrafts)

      useDraftsStore.getState().loadDrafts()

      expect(mockList).toHaveBeenCalledTimes(1)
      expect(useDraftsStore.getState().drafts).toHaveLength(2)
      expect(useDraftsStore.getState().isLoaded).toBe(true)
    })

    it('sets isLoaded to true on success', () => {
      mockList.mockReturnValue([])

      useDraftsStore.getState().loadDrafts()

      expect(useDraftsStore.getState().isLoaded).toBe(true)
    })

    it('sets isLoaded to true on error', () => {
      mockList.mockImplementation(() => {
        throw new Error('DB error')
      })

      useDraftsStore.getState().loadDrafts()

      expect(useDraftsStore.getState().isLoaded).toBe(true)
      expect(mockLogError).toHaveBeenCalledWith('Drafts', expect.any(Error))
    })

    it('preserves empty drafts array on error', () => {
      mockList.mockImplementation(() => {
        throw new Error('DB error')
      })

      useDraftsStore.getState().loadDrafts()

      expect(useDraftsStore.getState().drafts).toEqual([])
    })
  })

  describe('addDraft', () => {
    it('generates ID and createdAt for new draft', () => {
      const now = new Date()
      jest.useFakeTimers().setSystemTime(now)

      useDraftsStore.getState().addDraft({
        type: 'expense',
        item: 'New Draft',
        amountCents: 2000,
        occurredAt: '2024-06-15T12:00:00.000Z',
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-draft-uuid',
          createdAt: now.toISOString(),
        })
      )

      jest.useRealTimers()
    })

    it('adds draft to beginning of list', () => {
      useDraftsStore.setState({
        drafts: [createMockDraft({ id: 'existing-draft' })],
        isLoaded: true,
      })

      useDraftsStore.getState().addDraft({
        type: 'expense',
        item: 'New Draft',
        amountCents: 2000,
        occurredAt: '2024-06-15T12:00:00.000Z',
      })

      const drafts = useDraftsStore.getState().drafts
      expect(drafts[0].id).toBe('mock-draft-uuid')
      expect(drafts[1].id).toBe('existing-draft')
    })

    it('defaults starred to false', () => {
      useDraftsStore.getState().addDraft({
        type: 'expense',
        item: 'New Draft',
        amountCents: 2000,
        occurredAt: '2024-06-15T12:00:00.000Z',
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ starred: false })
      )
    })

    it('preserves starred value when provided', () => {
      useDraftsStore.getState().addDraft({
        type: 'expense',
        item: 'New Draft',
        amountCents: 2000,
        occurredAt: '2024-06-15T12:00:00.000Z',
        starred: true,
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ starred: true })
      )
    })

    it('throws on DB failure and does not update local state', () => {
      mockInsert.mockImplementation(() => {
        throw new Error('DB insert error')
      })
      useDraftsStore.setState({ drafts: [], isLoaded: true })

      expect(() =>
        useDraftsStore.getState().addDraft({
          type: 'expense',
          item: 'New Draft',
          amountCents: 2000,
          occurredAt: '2024-06-15T12:00:00.000Z',
        })
      ).toThrow('DB insert error')

      expect(useDraftsStore.getState().drafts).toHaveLength(0)
      expect(mockLogError).toHaveBeenCalledWith('Drafts', expect.any(Error))
    })

    it('includes all optional fields', () => {
      // Reset mock to clear previous error implementation
      mockInsert.mockReset()

      useDraftsStore.getState().addDraft({
        type: 'expense',
        item: 'Full Draft',
        amountCents: 2500,
        occurredAt: '2024-06-15T12:00:00.000Z',
        merchant: 'Test Merchant',
        note: 'Test note',
        tags: ['tag1', 'tag2'],
        categoryRef: { type: 'expense', categoryKey: 'food' },
        accountKey: 'checking',
        receiptUri: 'file://receipt.jpg',
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          merchant: 'Test Merchant',
          note: 'Test note',
          tags: ['tag1', 'tag2'],
          categoryRef: { type: 'expense', categoryKey: 'food' },
          accountKey: 'checking',
          receiptUri: 'file://receipt.jpg',
        })
      )
    })
  })

  describe('updateDraft', () => {
    beforeEach(() => {
      useDraftsStore.setState({
        drafts: [createMockDraft({ id: 'draft-1' })],
        isLoaded: true,
      })
    })

    it('does nothing when draft not found', () => {
      useDraftsStore.getState().updateDraft('nonexistent', { item: 'Updated' })

      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('updates draft in repository and local state', () => {
      useDraftsStore.getState().updateDraft('draft-1', { item: 'Updated Item' })

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'draft-1', item: 'Updated Item' })
      )
      expect(useDraftsStore.getState().drafts[0].item).toBe('Updated Item')
    })

    it('preserves unchanged fields', () => {
      useDraftsStore.getState().updateDraft('draft-1', { note: 'New note' })

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          item: 'Test Item',
          amountCents: 1500,
          note: 'New note',
        })
      )
    })

    it('throws on DB failure and does not update local state', () => {
      mockUpdate.mockImplementation(() => {
        throw new Error('DB update error')
      })

      expect(() =>
        useDraftsStore.getState().updateDraft('draft-1', { item: 'Updated' })
      ).toThrow('DB update error')

      expect(useDraftsStore.getState().drafts[0].item).toBe('Test Item')
      expect(mockLogError).toHaveBeenCalled()
    })
  })

  describe('removeDraft', () => {
    beforeEach(() => {
      useDraftsStore.setState({
        drafts: [
          createMockDraft({ id: 'draft-1' }),
          createMockDraft({ id: 'draft-2' }),
        ],
        isLoaded: true,
      })
    })

    it('removes draft from repository and local state', () => {
      useDraftsStore.getState().removeDraft('draft-1')

      expect(mockDelete).toHaveBeenCalledWith('draft-1')
      expect(useDraftsStore.getState().drafts).toHaveLength(1)
      expect(useDraftsStore.getState().drafts[0].id).toBe('draft-2')
    })

    it('throws on DB failure and does not update local state', () => {
      mockDelete.mockImplementation(() => {
        throw new Error('DB delete error')
      })

      expect(() => useDraftsStore.getState().removeDraft('draft-1')).toThrow('DB delete error')

      expect(useDraftsStore.getState().drafts).toHaveLength(2)
      expect(mockLogError).toHaveBeenCalled()
    })
  })

  describe('getDraft', () => {
    beforeEach(() => {
      useDraftsStore.setState({
        drafts: [createMockDraft({ id: 'draft-1', item: 'Found Draft' })],
        isLoaded: true,
      })
    })

    it('returns draft when found', () => {
      const result = useDraftsStore.getState().getDraft('draft-1')

      expect(result?.item).toBe('Found Draft')
    })

    it('returns undefined when not found', () => {
      const result = useDraftsStore.getState().getDraft('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('toggleStar', () => {
    beforeEach(() => {
      useDraftsStore.setState({
        drafts: [createMockDraft({ id: 'draft-1', starred: false })],
        isLoaded: true,
      })
    })

    it('toggles star in repository and local state', () => {
      mockToggleStar.mockReturnValue(true)

      useDraftsStore.getState().toggleStar('draft-1')

      expect(mockToggleStar).toHaveBeenCalledWith('draft-1')
      expect(useDraftsStore.getState().drafts[0].starred).toBe(true)
    })

    it('uses returned value from repository', () => {
      mockToggleStar.mockReturnValue(false)

      useDraftsStore.getState().toggleStar('draft-1')

      expect(useDraftsStore.getState().drafts[0].starred).toBe(false)
    })

    it('throws on DB failure and does not update local state', () => {
      mockToggleStar.mockImplementation(() => {
        throw new Error('DB toggle error')
      })

      expect(() => useDraftsStore.getState().toggleStar('draft-1')).toThrow('DB toggle error')

      expect(useDraftsStore.getState().drafts[0].starred).toBe(false)
      expect(mockLogError).toHaveBeenCalled()
    })
  })

  describe('clearAllDrafts', () => {
    beforeEach(() => {
      useDraftsStore.setState({
        drafts: [
          createMockDraft({ id: 'draft-1' }),
          createMockDraft({ id: 'draft-2' }),
        ],
        isLoaded: true,
      })
    })

    it('clears all drafts from repository and local state', () => {
      useDraftsStore.getState().clearAllDrafts()

      expect(mockClearAll).toHaveBeenCalledTimes(1)
      expect(useDraftsStore.getState().drafts).toEqual([])
    })

    it('throws on DB failure and does not update local state', () => {
      mockClearAll.mockImplementation(() => {
        throw new Error('DB clear error')
      })

      expect(() => useDraftsStore.getState().clearAllDrafts()).toThrow('DB clear error')

      expect(useDraftsStore.getState().drafts).toHaveLength(2)
      expect(mockLogError).toHaveBeenCalled()
    })
  })
})
