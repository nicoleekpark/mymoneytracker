import { CATEGORIES } from '@/config/categories.config'
import type { CategoryRef } from '@/domain/category'
import { formatUsdInt } from '@/ui/format/currency'

export type CategoryColors = Readonly<{
  palette: readonly string[]
  others: string
}>

export type CategorySlice = Readonly<{
  reactKey: string // 반드시 유니크 (React key)
  colorKey: string // 색상 고정용 (부모 카테고리 기준)
  label: string
  totalDollar: number
  percent: number // 0..1
  color: string
}>

// Re-export for backwards compatibility
export { formatUsdInt }

export function findCategoryName(ref?: CategoryRef): string {
  if (!ref) return 'Uncategorized'

  const cat = CATEGORIES.find((c: any) => c.type === ref.type && c.key === ref.categoryKey)
  if (!cat) return ref.categoryKey

  // nicole rule: label 대신 name 사용
  if (!ref.subCategoryKey) return String(cat.name ?? cat.key)

  const sub = (cat.subCategories ?? []).find((s: any) => s.key === ref.subCategoryKey)
  return String(sub?.name ?? ref.subCategoryKey)
}

function hashStringToInt(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function pickCategoryColor(colorKey: string, colors: CategoryColors): string {
  const idx = hashStringToInt(colorKey) % colors.palette.length
  return colors.palette[idx] ?? colors.palette[0] ?? '#999'
}

export function buildCategorySlices(args: {
  totalSpentDollar: number
  rows: Array<{ categoryId: string | null; categoryRef?: CategoryRef; totalDollar: number }>
  colors: CategoryColors
  topN?: number
}): CategorySlice[] {
  const topN = args.topN ?? 5

  const total = Number(args.totalSpentDollar ?? 0)
  if (!Number.isFinite(total) || total <= 0) return []

  const cleaned = (args.rows ?? [])
    .map((r) => ({
      categoryId: r.categoryId ?? null,
      ref: r.categoryRef,
      total: Number(r.totalDollar ?? 0)
    }))
    .filter((r) => Number.isFinite(r.total) && r.total > 0)
    .sort((a, b) => b.total - a.total)

  if (!cleaned.length) return []

  const top = cleaned.slice(0, topN)
  const rest = cleaned.slice(topN)

  const slices: CategorySlice[] = top.map((r) => {
    const label = findCategoryName(r.ref)

    const type = r.ref?.type ?? 'expense'
    const catKey = r.ref?.categoryKey ?? 'uncategorized'
    const subKey = r.ref?.subCategoryKey ?? 'na'

    // ✅ React key must be unique
    // const reactKey = r.categoryId ? `cat:${r.categoryId}` : `${type}:${catKey}:${subKey}`
    const reactKey =
      r.categoryId
        ? `cat:${r.categoryId}`
        : `fallback:${type}:${catKey}:${subKey}:${Math.round(r.total * 100)}`

    // ✅ Color key should be stable per parent category
    const colorKey = `${type}:${catKey}`

    const percent = r.total / total
    const color = pickCategoryColor(colorKey, args.colors)

    return { reactKey, colorKey, label, totalDollar: r.total, percent, color }
  })

  const othersTotal = rest.reduce((sum, r) => sum + r.total, 0)
  if (othersTotal > 0) {
    slices.push({
      reactKey: 'others',
      colorKey: 'others',
      label: 'Others',
      totalDollar: othersTotal,
      percent: othersTotal / total,
      color: args.colors.others
    })
  }

  return slices
}
