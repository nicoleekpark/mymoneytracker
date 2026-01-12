import { CategoryType } from '@/domain/category'
import { UUID } from '@/domain/common/uuid'

export type SubCategoryMeta = Readonly<{
  key: UUID
  name: string
  icon: string
  color: string
}>

export type CategoryMeta = Readonly<{
  key: UUID
  name: string
  icon: string
  color: string
  type: CategoryType
  subCategories: ReadonlyArray<SubCategoryMeta>
}>

