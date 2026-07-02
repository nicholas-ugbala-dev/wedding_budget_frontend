import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/store/requests/categories'
import { CATEGORIES_KEY } from '@/store/queryKeys'
import type { Category } from '@/types/category'

export const useGetCategories = (ceremonyId?: string) =>
  useQuery<Category[]>({
    queryKey: [CATEGORIES_KEY, ceremonyId],
    queryFn:  () => fetchCategories(ceremonyId ? { ceremony_id: ceremonyId } : undefined),
  })
