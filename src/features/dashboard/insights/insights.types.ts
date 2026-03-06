export type EvidenceItem = Readonly<{
  key: string
  value: string
  detail?: string
}>

export type CTAButton = Readonly<{
  label: string
  variant: 'primary' | 'secondary' | 'ghost'
  route?: string // future navigation
}>

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INSIGHT BADGE SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Two severity levels only. Most insights have NO badge - let content speak.
 * Badges are reserved for items that need user attention.
 *
 * ┌──────────┬─────────────────────┬──────────────┬────────────────────────┐
 * │ Level    │ Icon                │ Color        │ When to use            │
 * ├──────────┼─────────────────────┼──────────────┼────────────────────────┤
 * │ caution  │ exclamation-triangle│ warning      │ Volatility high,       │
 * │          │ (△)                 │ (amber)      │ spending spike         │
 * ├──────────┼─────────────────────┼──────────────┼────────────────────────┤
 * │ alert    │ exclamation-circle  │ danger       │ Many missing days,     │
 * │          │ (○)                 │ (red)        │ data gaps, anomaly     │
 * └──────────┴─────────────────────┴──────────────┴────────────────────────┘
 *
 * Normal insights (baseline, driver, opportunities) have NO badge.
 */

export type InsightBadge = 'caution' | 'alert'

/** Badge config: icon, color token, and meaning */
export const BADGE_CONFIG: Record<InsightBadge, {
  icon: string         // FontAwesome icon name
  colorKey: string     // Theme color key (warning, danger)
  label: string        // Accessible label
  meaning: string      // User-facing explanation
}> = {
  caution: {
    icon: 'exclamation-triangle',
    colorKey: 'warning',
    label: 'Caution',
    meaning: 'This needs your attention'
  },
  alert: {
    icon: 'exclamation-circle',
    colorKey: 'danger',
    label: 'Alert',
    meaning: 'Something appears to be off'
  }
}

export type InsightCardData = Readonly<{
  id: string
  type: 'driver' | 'baseline' | 'volatility' | 'streak' | 'watchout' | 'opportunity'
  title: string
  body: string // headline text
  badge?: InsightBadge // emoji badge indicating confidence/status
  sub?: string // context paragraph below headline
  evidence?: EvidenceItem[] // key-value pairs for "What changed", "Why we think"
  ctas?: CTAButton[] // action buttons
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
  color: string | null
}>

export type DailyOutflow = Readonly<{
  day: number // 1-31
  amount: number // dollar amount
}>

// Summary pill types per spec
export type PillTone = 'neutral' | 'positive' | 'negative' | 'warning'

export type PillValue = Readonly<{
  primary: string   // main value (colored by tone)
  secondary?: string // context text (muted)
}>

export type SummaryPill = Readonly<{
  id: 'net_vs_baseline' | 'primary_driver' | 'data_quality'
  label: string
  value: PillValue
  tone: PillTone
  isVisible: boolean
  size?: 'default' | 'large' // large = two-line layout
}>

export type InsightsSummary = Readonly<{
  pills: SummaryPill[]
  // Raw data for calculations
  netCents: number
  baselineNetCents: number | null
  driverCategory: string | null
  driverDeltaCents: number | null
  dataQuality: 'complete' | 'mostly_complete' | 'incomplete'
  unknownDayCount: number
}>

export type InsightsData = Readonly<{
  // Summary pills
  summary: InsightsSummary

  // Flat stack of insights (no sections)
  insights: InsightCardData[]

  // Chart data
  categoryComparison: CategoryComparison[]
  netTrend: NetTrendPoint[]
  weekdayPattern: WeekdaySpend[]
  dailyOutflow: DailyOutflow[]
  medianNet: number | null

  // Metadata
  monthYYYYMM: string
  hasEnoughData: boolean
}>

export type InsightsColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
  warning: string
}>
