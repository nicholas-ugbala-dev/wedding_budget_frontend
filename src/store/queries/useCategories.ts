import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/store/requests/categories'
import { CATEGORIES_KEY } from '@/store/queryKeys'
import type { Category } from '@/types/category'

export const useGetCategories = (eventId?: string) =>
  useQuery<Category[]>({
    queryKey: [CATEGORIES_KEY, eventId],
    queryFn:  () => fetchCategories(eventId ? { event_id: eventId } : undefined),
  })
