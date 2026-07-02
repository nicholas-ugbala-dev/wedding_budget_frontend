import { useNavigate } from '@tanstack/react-router'
import { badgeStyle, cerStyle } from '@/lib/utils'
import type { NeedsAttentionBadge } from '@/types/dashboard'

interface AttentionItem {
  expense_id: string; name: string
  vendor_name: string | null; event_name: string | null
  badge: NeedsAttentionBadge
}
interface Props { data: AttentionItem[] }

// function subText(item: AttentionItem): string {
//   const parts = [item.vendor_name, item.ceremony_name].filter(Boolean)
//   return parts.length > 0 ? parts.join(' · ') : 'No vendor'
// }

export function NeedsAttention({ data }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-surface border border-border rounded-[10px] px-5 py-[18px]">

      {/* Header with count badge */}
      <div className="flex items-center gap-2 mb-3.5">
        <div className="text-[13px] font-medium text-text-primary">Needs attention</div>
        {data.length > 0 && (
          <span
            className="text-[10px] font-semibold"
            style={{ color: '#C43C3C', background: '#FDF0F0', padding: '1px 7px', borderRadius: 100 }}
          >
            {data.length}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="text-[13px] text-text-muted">All good — nothing needs attention</div>
      ) : (
        <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: 260 }}>
          {data.map((item, i) => {
            const badge = badgeStyle(item.badge)
             const cer = cerStyle(i)
            return (
              <div
                key={item.expense_id}
                onClick={() => navigate({ to: '/expenses/$expenseId', params: { expenseId: item.expense_id } })}
                className="flex items-start justify-between cursor-pointer"
                style={{ padding: '8px 10px', background: '#FAFAF8', border: '1px solid #F0EDE6', borderRadius: 7, gap: 8 }}
              >
                 <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[12px] font-medium text-text-primary truncate">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    {item.event_name && (
                      <span className="text-[11px] text-text-muted px-2 py-0.5 rounded-full">
                        {item.event_name}
                      </span>
                    )}
                    <span 
                      className="text-[11px]  px-2 py-0.5 rounded-full"
                      style={{ background: cer.bg, color: cer.color }}
                    >
                      {item.vendor_name ?? 'No vendor'}
                    </span>
                  </div>
                </div>

                {/* Badge */}
                <div
                  className="text-[10px] font-medium shrink-0 whitespace-nowrap"
                  style={{ padding: '2px 8px', borderRadius: 100, background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
