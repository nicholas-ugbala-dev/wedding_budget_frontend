import { useQuery } from '@tanstack/react-query';
import { getMeRequest } from '@/store/requests/auth';
import { type User } from '@/types/auth';
import { ME_KEY } from '@/store/queryKeys';

export const useGetMe = () =>
    useQuery<User>({
        queryKey: [ME_KEY],
        queryFn: getMeRequest,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });