import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CEREMONIES_KEY } from '@/store/queryKeys';
import { toast } from 'sonner';
import type { ApiError } from '@/types/api';
import { 
    createCeremony,
    updateCeremony,
    deleteCeremony 
} from '@/store/requests/ceremonies';

export const useCreateCeremony = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCeremony,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CEREMONIES_KEY] });
      toast.success('Ceremony added');
    },
    onError: (err: ApiError) =>
        toast.error(err.response?.data?.message ?? 'Failed to add ceremony'),
  })
}

export const useUpdateCeremony = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCeremony,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CEREMONIES_KEY] });
      toast.success('Ceremony updated');
    },
    onError: (err: ApiError) =>
        toast.error(err.response?.data?.message ?? 'Failed to update ceremony'),
  })
}

export const useDeleteCeremony = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCeremony,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CEREMONIES_KEY] });
      toast.success('Ceremony deleted');
    },
    onError: (err: ApiError) => 
        toast.error(err.response?.data?.message ?? 'Failed to delete ceremony'),
  })
}