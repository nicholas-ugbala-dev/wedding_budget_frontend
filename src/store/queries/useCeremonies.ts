import { useQuery } from '@tanstack/react-query';
import { fetchCeremonies } from '@/store/requests/ceremonies';
import { CEREMONIES_KEY } from '@/store/queryKeys';
import { type Ceremony } from '@/types/ceremony';

export const useGetCeremonies = () =>
    useQuery<Ceremony[]>({
        queryKey: [CEREMONIES_KEY],
        queryFn: fetchCeremonies,
    });