import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient, updateClient, deleteClient } from '@/store/requests/clients'
import { CLIENTS_KEY } from '@/store/queryKeys'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'

export const useCreateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTS_KEY] })
      toast.success('Client added')
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message ?? 'Failed to add client')
    },
  })
}

export const useUpdateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTS_KEY] })
      toast.success('Client updated')
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message ?? 'Failed to update client')
    },
  })
}

export const useDeleteClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLIENTS_KEY] })
      toast.success('Client removed')
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message ?? 'Failed to remove client')
    },
  })
}
