import DashboardScreen from '@/features/dashboard/DashboardScreen'
import { DevToolsOverlay } from '@/shared/components/dev/DevToolsOverlay'

export default function DashboardRoute() {
  return (
    <>
      <DashboardScreen />
      <DevToolsOverlay />
    </>
  )
}
