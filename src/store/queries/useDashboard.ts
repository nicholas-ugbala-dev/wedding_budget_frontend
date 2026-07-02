import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '@/store/requests/dashboard'
import { DASHBOARD_KEY } from '@/store/queryKeys'
import type { DashboardData } from '@/types/dashboard'

export const useGetDashboard = (eventId?: string) =>
  useQuery<DashboardData>({
    queryKey: [DASHBOARD_KEY, eventId],
    queryFn:  () => fetchDashboard(eventId ? { event_id: eventId } : undefined),
  })