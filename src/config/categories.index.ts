import type { CategoryType } from '@/domain/category'
import { CATEGORIES } from './categories.config'

export type CategoryIndex = Readonly<
  Record<CategoryType, Readonly<Record<string, readonly string[]>>>
>

function buildCategoryIndex(): CategoryIndex {
  const base: Record<CategoryType, Record<string, string[]>> = {
    expense: {},
    income: {},
    transfer: {}
  } as Record<CategoryType, Record<string, string[]>>

  for (const cat of CATEGORIES) {
    base[cat.type as CategoryType][cat.key] = cat.subCategories.map(sc => sc.key)
  }

  return base
}

export const CATEGORIES_INDEX: CategoryIndex = buildCategoryIndex() 
/**
 * CATEGORIES_INDEX = {
    expense: {
      housing: ['rent', 'utilities', 'maintenance'],
      food: ['groceries', 'eating_out'],
      transportation: ['public_transit', 'fuel', 'maintenance'],
      // ... other expense categories
    },
    income: {
      salary: ['monthly_salary', 'bonuses'],
      investments: ['dividends', 'capital_gains'],
      // ... other income categories
    },
    transfer: {
      internal: ['savings_to_checking', 'checking_to_savings'],
      external: ['to_other_bank', 'from_other_bank'],
      // ... other transfer categories
    }
  }   
 */