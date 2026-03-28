// ═══════════════════════════════════════════════════════════════════════════
// ROUTE FILE: Transactions Tab
// Thin bridge to the feature component.
// URL params (like ?focusDate=2024-03-15) are read inside TransactionsScreen
// using useLocalSearchParams() hook.
// ═══════════════════════════════════════════════════════════════════════════
import TransactionsScreen from '@/features/transactions/list/TransactionsScreen'

export default function TransactionsRoute() {
  return <TransactionsScreen />
}
