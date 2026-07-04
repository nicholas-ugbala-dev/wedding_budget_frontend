import { useQuery } from '@tanstack/react-query'

export function useExchangeRate(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: ['fx', from, to],
    queryFn: async ({ signal }: { signal: AbortSignal }) => {
      const r = await fetch(`https://open.er-api.com/v6/latest/${from}`, { signal })
      const d = await r.json() as { rates?: Record<string, number> }
      return d?.rates?.[to] ?? null
    },
    enabled: enabled && from !== to,
    staleTime: 5 * 60 * 1000,
  })
}
