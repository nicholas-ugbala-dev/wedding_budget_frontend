import { useQuery } from '@tanstack/react-query';
import { fetchCurrencies } from '@/store/requests/currencies';
import { CURRENCIES_KEY } from '@/store/queryKeys';

export const useGetCurrencies = () =>
    useQuery({
        queryKey: [CURRENCIES_KEY],
        queryFn: fetchCurrencies,
    });
