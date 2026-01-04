import type { CategoryType } from '@/domain/category'
import { CATEGORIES } from './categories.config'

export type CategoryIndex = Readonly<
  Record<CategoryType, Readonly<Record<string, readonly string[]>>>
>

export function buildCategoryIndex(): CategoryIndex {
  const base: Record<CategoryType, Record<string, string[]>> = {
    expense: {},
    income: {},
    transfer: {}
  } satisfies Record<CategoryType, Record<string, string[]>>

  for (const cat of CATEGORIES) {
    base[cat.type][cat.id] = cat.subCategories.map(sc => sc.id)
  }

  return base
}

// CategoryIndex = {
//   expense: {
//     housing: ['property_tax', 'utilities', 'hoa', 'repairs', 'home_insurance'],
//     food: ['groceries', 'eating_out'],
//     lifestyle: ['home_items', 'clothes', 'beauty', 'electronics', 'misc'],
//     ...
//   },
//   income: {
//     ...
//   },
//   transfer: {
//     savings: ['monthly_savings', 'emergency', 'investing', 'retirement']
//   }
// }

// why do we need this
// 4 “왜 필요한지”를 너 데이터로 딱 보여줄게

// 너가 Transaction을 만들 때, 저장할 카테고리는 이런 형태(CategoryRef)로 저장하자고 했지
// ref = { type: 'expense', categoryId: 'housing', subCategoryId: 'hoa' }

// 여기서 도메인이 검사해야 하는 질문은 이거야
// 'expense' 타입에 'housing' 카테고리가 존재하나
// 그 안에 'hoa' 서브카테고리가 존재하나
// CategoryIndex가 있으면 검증이 이렇게 끝나
// index.expense.housing.includes('hoa') // true

// 근데 CategoryIndex가 없고 CATEGORIES만 있으면
// 배열 CATEGORIES를 돌면서 housing 찾고
// 그 안에서 subCategories를 또 돌면서 hoa 찾고
// 즉, 로직이 길어지고 실수 확률이 커져
// 그리고 더 큰 이유
// CATEGORIES는 UI 메타가 자주 바뀐다 (색상, 다국어 name, icon, 정렬 방식 등)

// 도메인은 id 조합만 신경 써야 한다
// → 그래서 “UI 구조 변경이 도메인에 전파되지 않도록” 얇은 변환층이 필요해