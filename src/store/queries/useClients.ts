import { useQuery } from '@tanstack/react-query'
import { fetchClients } from '@/store/requests/clients'
import { CLIENTS_KEY } from '@/store/queryKeys'
import type { PaginatedResult } from '@/types/pagination'
import type { Client } from '@/types/client'

export const useGetClients = (params: { search?: string; page?: number; limit?: number } = {}) => {
  const { search, page = 1, limit = 10 } = params
  const query: Record<string, unknown> = { page, limit }
  if (search?.trim()) query.search = search.trim()

  return useQuery<PaginatedResult<Client>>({
    queryKey: [CLIENTS_KEY, query],
    queryFn: () => fetchClients(query),
  })
}
