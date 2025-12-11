export type CategoryType = 'expense' | 'income' | 'transfer'

export type SubCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type Category = {
  id: string
  name: string
  icon: string
  color: string
  type: CategoryType
  subCategories: SubCategory[]
}

