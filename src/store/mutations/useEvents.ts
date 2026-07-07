import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EVENTS_KEY, CURRENCIES_KEY } from '@/store/queryKeys';
import { toast } from 'sonner';
import type { ApiError } from '@/types/api';
import {
    createEvent,
    updateEvent,
    deleteEvent,
} from '@/store/requests/events';

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EVENTS_KEY] });
      qc.invalidateQueries({ queryKey: [CURRENCIES_KEY] });
      toast.success('Event added');
    },
    onError: (err: ApiError) =>
        toast.error(err.response?.data?.message ?? 'Failed to add event'),
  })
}

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EVENTS_KEY] });
      qc.invalidateQueries({ queryKey: [CURRENCIES_KEY] });
      toast.success('Event updated');
    },
    onError: (err: ApiError) =>
        toast.error(err.response?.data?.message ?? 'Failed to update event'),
  })
}

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EVENTS_KEY] });
      toast.success('Event deleted');
    },
    onError: (err: ApiError) =>
        toast.error(err.response?.data?.message ?? 'Failed to delete event'),
  })
}
