import { execMany } from '@/lib/db/sqlite'
import type { Migration } from './types'

export const m20260106121718_init: Migration = {
  id: 20260106121718,
  name: 'init',
  up: () => {
    execMany(``)
  },
}
