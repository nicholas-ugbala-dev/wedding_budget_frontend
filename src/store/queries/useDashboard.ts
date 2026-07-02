import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '@/store/requests/dashboard'
import { DASHBOARD_KEY } from '@/store/queryKeys'
import type { DashboardData } from '@/types/dashboard'

export const useGetDashboard = (ceremonyId?: string) =>
  useQuery<DashboardData>({
    queryKey: [DASHBOARD_KEY, ceremonyId],
    queryFn:  () => fetchDashboard(ceremonyId ? { ceremony_id: ceremonyId } : undefined),
  })