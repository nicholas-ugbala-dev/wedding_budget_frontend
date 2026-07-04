import { useGetMe } from './useAuth'
import { useClientStore } from '@/store/useClientStore'

export function useBaseCurrency(): string {
    const { data: user } = useGetMe()
    const { activeClient } = useClientStore()
    const isPlanner = user?.account_type === 'planner'
    return (isPlanner && activeClient) ? activeClient.currency_code : (user?.base_currency ?? 'NGN')
}
