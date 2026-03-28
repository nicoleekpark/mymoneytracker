// ═══════════════════════════════════════════════════════════════════════════
// ROUTE FILE: Dashboard Tab
// This is a "thin bridge" - it just imports and renders the feature component.
// WHY: Keeps routing separate from business logic. Feature can be tested alone.
// ═══════════════════════════════════════════════════════════════════════════
import DashboardScreen from '@/features/dashboard/DashboardScreen'

// Named "index.tsx" = default screen for (tabs) folder = first tab shown
export default function DashboardRoute() {
  return <DashboardScreen />  // All the real work happens in DashboardScreen
}
