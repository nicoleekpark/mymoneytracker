export type DailyFlow = Readonly<{
  day: string // YYYY-MM-DD
  incomeDollar: number
  expenseDollar: number
  txCount: number
}>

export type CalendarColors = Readonly<{
  text: string
  textMuted: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>
