import { useQuery } from '@tanstack/react-query'
import { fetchClients } from '@/store/requests/clients'
import { CLIENTS_KEY } from '@/store/queryKeys'
import type { Client } from '@/types/client'

export const useGetClients = () =>
  useQuery<Client[]>({ queryKey: [CLIENTS_KEY], queryFn: fetchClients })
