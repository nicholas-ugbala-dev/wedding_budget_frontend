import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CURRENCIES_KEY } from '@/store/queryKeys'
import { toast } from 'sonner'
import { addCurrency, removeCurrency } from '@/store/requests/currencies'
import type { ApiError } from '@/types/api'

export const useAddCurrency = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addCurrency,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CURRENCIES_KEY] })
      toast.success('Wallet added')
    },
    onError: (err: ApiError) =>
      toast.error(err.response?.data?.message ?? 'Failed to add wallet'),
  })
}

export const useRemoveCurrency = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: removeCurrency,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CURRENCIES_KEY] })
      toast.success('Wallet removed')
    },
    onError: (err: ApiError) =>
      toast.error(err.response?.data?.message ?? 'Failed to remove wallet'),
  })
}
