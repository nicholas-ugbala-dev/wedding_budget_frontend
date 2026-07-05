import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/store/requests/events';
import { EVENTS_KEY } from '@/store/queryKeys';
import { useGetMe } from '@/store/queries/useAuth';
import { useClientStore } from '@/store/useClientStore';
import { type Event } from '@/types/event';

export const useGetEvents = () => {
    const { data: user } = useGetMe();
    const { activeClient } = useClientStore();
    const isPlanner = user?.account_type === 'planner';
    const clientId = isPlanner ? activeClient?.id : undefined;

    return useQuery<Event[]>({
        queryKey: [EVENTS_KEY, clientId],
        queryFn: () => fetchEvents(clientId ? { client_id: clientId } : undefined),
    });
};
