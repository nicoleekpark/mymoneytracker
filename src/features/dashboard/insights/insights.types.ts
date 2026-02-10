export type InsightCardData = Readonly<{
  id: string
  type: 'change' | 'driver' | 'nudge' | 'baseline' | 'volatility' | 'streak' | 'watchout' | 'opportunity'
  title: string
  body: string
  // Optional metadata for bottom sheet explanation
  explanation?: {
    calculation: string
    whatMatters: string
  }
}>

// Chart data types
export type NetTrendPoint = Readonly<{
  month: string // YYYY-MM
  net: number
}>

export type WeekdaySpend = Readonly<{
  day: number // 0 = Sun, 1 = Mon, ..., 6 = Sat
  avgSpend: number
}>

export type CategoryComparison = Readonly<{
  name: string
  thisMonth: number
  lastMonth: number
}>

export type InsightsData = Readonly<{
  // This month section
  thisMonth: {
    changeVsLastMonth: InsightCardData | null
    primaryDriver: InsightCardData | null
    categoryComparison: CategoryComparison[] // For delta bar chart
  }

  // Patterns section
  patterns: {
    netBaseline: InsightCardData | null
    volatilityCheck: InsightCardData | null
    positiveStreak: InsightCardData | null
    quietDays: InsightCardData | null
    netTrend: NetTrendPoint[] // For sparkline
    weekdayPattern: WeekdaySpend[] // For heat hint
    medianNet: number | null // Baseline for sparkline
  }

  // Watchouts section
  watchouts: InsightCardData[]

  // Opportunities section
  opportunities: InsightCardData[]

  // Metadata
  monthYYYYMM: string
  hasEnoughData: boolean
}>

export type InsightsColors = Readonly<{
  text: string
  textMuted: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>
