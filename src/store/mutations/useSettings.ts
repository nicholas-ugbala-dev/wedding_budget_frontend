import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ME_KEY } from '@/store/queryKeys'
import { toast } from 'sonner'
import { updateAccountRequest } from '@/store/requests/settings'
import type { ApiError } from '@/types/api'

export const useUpdateAccount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateAccountRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ME_KEY] })
      toast.success('Account updated')
    },
    onError: (err: ApiError) =>
      toast.error(err.response?.data?.message ?? 'Failed to update account'),
  })
}
