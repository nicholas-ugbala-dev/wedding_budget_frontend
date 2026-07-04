import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '@/store/requests/dashboard'
import { DASHBOARD_KEY } from '@/store/queryKeys'
import { useGetMe } from '@/store/queries/useAuth'
import { useClientStore } from '@/store/useClientStore'
import type { DashboardData } from '@/types/dashboard'

export const useGetDashboard = (eventId?: string) => {
  const { data: user } = useGetMe()
  const { activeClient } = useClientStore()
  const isPlanner = user?.account_type === 'planner'
  const clientId = isPlanner ? activeClient?.id : undefined

  return useQuery<DashboardData>({
    queryKey: [DASHBOARD_KEY, eventId, clientId],
    queryFn:  () => {
      const params: { event_id?: string; client_id?: string } = {}
      if (eventId) params.event_id = eventId
      if (clientId) params.client_id = clientId
      return fetchDashboard(Object.keys(params).length ? params : undefined)
    },
  })
}