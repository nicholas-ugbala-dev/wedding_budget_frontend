import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/store/requests/events';
import { EVENTS_KEY } from '@/store/queryKeys';
import { type Event } from '@/types/event';

export const useGetEvents = () =>
    useQuery<Event[]>({
        queryKey: [EVENTS_KEY],
        queryFn: fetchEvents,
    });
