import type { CategoryType } from '@/domain/category'
import { UUID } from '@/domain/common/uuid'

export type SubCategory = Readonly<{
  id: UUID
  name: string
  icon: string
  color: string
}>

export type Category = Readonly<{
  id: UUID
  name: string
  icon: string
  color: string
  type: CategoryType
  subCategories: SubCategory[]
}>

