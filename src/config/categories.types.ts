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
  isFixed: boolean // Fixed costs (housing, utilities, insurance) vs variable (food, shopping)
  subCategories: ReadonlyArray<SubCategoryMeta>
}>

