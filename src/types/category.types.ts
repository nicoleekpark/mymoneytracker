import type { CategoryType } from '@/domain/category';

export type SubCategory = Readonly<{
  id: string
  name: string
  icon: string
  color: string
}>

export type Category = Readonly<{
  id: string
  name: string
  icon: string
  color: string
  type: CategoryType
  subCategories: SubCategory[]
}>

