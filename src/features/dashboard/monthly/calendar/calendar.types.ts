export type DailyFlow = Readonly<{
  day: string // YYYY-MM-DD
  incomeDollar: number
  expenseDollar: number
  variableExpenseDollar: number // Expense excluding fixed costs
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
  highlight: string // Lavender - for low-spend/zero-spend days
}>
