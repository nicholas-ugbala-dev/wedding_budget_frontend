import { instance } from '@/services/axios'
import * as api from '@/services/api'
import type { Client } from '@/types/client'

export const fetchClients = (): Promise<Client[]> =>
  instance.get(api.CLIENTS).then(r => r.data.data)

export const createClient = (data: { first_name: string; last_name: string; currency_code: string }): Promise<Client> =>
  instance.post(api.CLIENTS, data).then(r => r.data.data)

export const updateClient = ({ id, ...data }: { id: string; first_name?: string; last_name?: string; currency_code?: string }): Promise<Client> =>
  instance.patch(api.CLIENT_BY_ID(id), data).then(r => r.data.data)

export const deleteClient = (id: string) =>
  instance.delete(api.CLIENT_BY_ID(id)).then(r => r.data)
