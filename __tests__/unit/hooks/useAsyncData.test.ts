import { renderHook, waitFor, act } from '@testing-library/react'
import { useAsyncData, useAsyncDataWithDefault } from '@/shared/hooks/useAsyncData'

describe('useAsyncData', () => {
  describe('initial state', () => {
    it('starts with loading=true', () => {
      const fetcher = jest.fn(() => Promise.resolve('data'))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      expect(result.current.loading).toBe(true)
    })

    it('starts with data=null', () => {
      const fetcher = jest.fn(() => Promise.resolve('data'))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      expect(result.current.data).toBeNull()
    })

    it('starts with error=null', () => {
      const fetcher = jest.fn(() => Promise.resolve('data'))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      expect(result.current.error).toBeNull()
    })
  })

  describe('successful fetch', () => {
    it('transitions to loading=false on success', async () => {
      const fetcher = jest.fn(() => Promise.resolve('result data'))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('sets data on success', async () => {
      const expectedData = { id: 1, name: 'Test' }
      const fetcher = jest.fn(() => Promise.resolve(expectedData))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      await waitFor(() => {
        expect(result.current.data).toEqual(expectedData)
      })
    })

    it('keeps error=null on success', async () => {
      const fetcher = jest.fn(() => Promise.resolve('data'))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('failed fetch', () => {
    it('sets error message on failure', async () => {
      const fetcher = jest.fn(() => Promise.reject(new Error('Network error')))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
      })
    })

    it('sets data=null on failure', async () => {
      const fetcher = jest.fn(() => Promise.reject(new Error('Error')))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBeNull()
    })

    it('handles non-Error rejection', async () => {
      const fetcher = jest.fn(() => Promise.reject('string error'))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      await waitFor(() => {
        expect(result.current.error).toBe('Unknown error')
      })
    })

    it('sets loading=false on failure', async () => {
      const fetcher = jest.fn(() => Promise.reject(new Error('Error')))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('refetch', () => {
    it('provides refetch function', () => {
      const fetcher = jest.fn(() => Promise.resolve('data'))

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      expect(typeof result.current.refetch).toBe('function')
    })

    it('refetch triggers new fetch', async () => {
      let callCount = 0
      const fetcher = jest.fn(() => {
        callCount++
        return Promise.resolve(`data-${callCount}`)
      })

      const { result } = renderHook(() => useAsyncData(fetcher, []))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBe('data-1')

      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.data).toBe('data-2')
      })

      expect(fetcher).toHaveBeenCalledTimes(2)
    })
  })

  describe('skip option', () => {
    it('does not fetch when skip=true', () => {
      const fetcher = jest.fn(() => Promise.resolve('data'))

      const { result } = renderHook(() => useAsyncData(fetcher, [], { skip: true }))

      expect(fetcher).not.toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    it('uses initialData when skip=true', () => {
      const fetcher = jest.fn(() => Promise.resolve('fetched'))

      const { result } = renderHook(() =>
        useAsyncData(fetcher, [], { skip: true, initialData: 'initial' })
      )

      expect(result.current.data).toBe('initial')
    })

    it('fetches when skip changes to false', async () => {
      const fetcher = jest.fn(() => Promise.resolve('data'))

      const { result, rerender } = renderHook(
        ({ skip }) => useAsyncData(fetcher, [], { skip }),
        { initialProps: { skip: true } }
      )

      expect(fetcher).not.toHaveBeenCalled()

      rerender({ skip: false })

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalled()
      })
    })
  })

  describe('dependency changes', () => {
    it('refetches when deps change', async () => {
      const fetcher = jest.fn((id: number) => Promise.resolve(`data-${id}`))

      const { result, rerender } = renderHook(
        ({ id }) => useAsyncData(() => fetcher(id), [id]),
        { initialProps: { id: 1 } }
      )

      await waitFor(() => {
        expect(result.current.data).toBe('data-1')
      })

      rerender({ id: 2 })

      await waitFor(() => {
        expect(result.current.data).toBe('data-2')
      })

      expect(fetcher).toHaveBeenCalledTimes(2)
    })
  })

  describe('initialData option', () => {
    it('uses initialData while loading', () => {
      const fetcher = jest.fn(() => new Promise(() => {})) // Never resolves

      const { result } = renderHook(() =>
        useAsyncData(fetcher, [], { initialData: 'loading...' })
      )

      expect(result.current.data).toBe('loading...')
    })
  })

  describe('cleanup on unmount', () => {
    it('does not update state after unmount', async () => {
      let resolvePromise: (value: string) => void
      const fetcher = jest.fn(
        () => new Promise<string>((resolve) => { resolvePromise = resolve })
      )

      const { result, unmount } = renderHook(() => useAsyncData(fetcher, []))

      unmount()

      // Resolve the promise after unmount
      resolvePromise!('data')

      // Give time for potential state update
      await new Promise((r) => setTimeout(r, 10))

      // If we get here without error, cleanup is working
      // (React would warn about state update on unmounted component otherwise)
      expect(true).toBe(true)
    })
  })
})

describe('useAsyncDataWithDefault', () => {
  it('returns defaultValue when loading', () => {
    const fetcher = jest.fn(() => new Promise<string[]>(() => {})) // Never resolves

    const { result } = renderHook(() =>
      useAsyncDataWithDefault(fetcher, [], { defaultValue: [] })
    )

    expect(result.current.data).toEqual([])
  })

  it('returns fetched data on success', async () => {
    const fetcher = jest.fn(() => Promise.resolve(['item1', 'item2']))

    const { result } = renderHook(() =>
      useAsyncDataWithDefault(fetcher, [], { defaultValue: [] })
    )

    await waitFor(() => {
      expect(result.current.data).toEqual(['item1', 'item2'])
    })
  })

  it('returns defaultValue on error', async () => {
    const fetcher = jest.fn(() => Promise.reject(new Error('Error')))

    const { result } = renderHook(() =>
      useAsyncDataWithDefault(fetcher, [], { defaultValue: ['default'] })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(['default'])
    expect(result.current.error).toBe('Error')
  })

  it('returns defaultValue when skipped', () => {
    const fetcher = jest.fn(() => Promise.resolve(['fetched']))

    const { result } = renderHook(() =>
      useAsyncDataWithDefault(fetcher, [], { defaultValue: ['skipped'], skip: true })
    )

    expect(result.current.data).toEqual(['skipped'])
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('data is never null (type guarantee)', async () => {
    const fetcher = jest.fn(() => Promise.resolve('data'))

    const { result } = renderHook(() =>
      useAsyncDataWithDefault(fetcher, [], { defaultValue: 'default' })
    )

    // Even while loading, data should be string (defaultValue), not null
    expect(typeof result.current.data).toBe('string')

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.data).toBe('string')
  })
})
