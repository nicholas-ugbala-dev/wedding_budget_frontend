import { useQuery } from '@tanstack/react-query'
import { fetchVendors } from '@/store/requests/vendors'
import { VENDORS_KEY } from '@/store/queryKeys'
import type { Vendor } from '@/types/vendor'

export const useGetVendors = () =>
  useQuery<Vendor[]>({
    queryKey: [VENDORS_KEY],
    queryFn: () => fetchVendors(),
  })
