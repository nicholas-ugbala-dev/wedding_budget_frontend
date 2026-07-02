import { fCurrency } from '@/lib/format'

interface BarItem { category: string; actual_amount: string; total_paid: string }
interface Props { data: BarItem[]; currency: string; isLoading: boolean }

export function SpendingChart({ data, currency, isLoading }: Props) {
  const top5 = [...data]
    .sort((a, b) => Number(b.actual_amount) - Number(a.actual_amount))
    .slice(0, 5)
  const maxActual = Math.max(...top5.map(d => Number(d.actual_amount)), 1)

  return (
    <div className="bg-surface border border-border rounded-[10px] px-5 py-[18px]">
      <div className="text-[13px] font-medium text-text-primary mb-4">Budget vs actual — top items</div>

      {isLoading ? (
        <div className="text-[13px] text-text-muted">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-[13px] text-text-muted">No expenses yet</div>
      ) : (
        <>
          <div className="flex flex-col gap-[9px] mb-2.5">
            {top5.map(item => {
              const actual = Number(item.actual_amount)
              const paid   = Number(item.total_paid)
              // both percentages are relative to the same max — keeps bars on the same scale
              const budgetPct = (actual / maxActual) * 100
              const paidPct   = (paid   / maxActual) * 100

              return (
                <div
                  key={item.category}
                  style={{ display: 'grid', gridTemplateColumns: '84px 1fr 64px', alignItems: 'center', gap: 10 }}
                >
                  {/* Label */}
                  <div
                    className="text-[11px] text-text-secondary text-right leading-snug overflow-hidden"
                    style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                  >
                    {item.category}
                  </div>

                  {/* Bar */}
                  <div
                    className="relative overflow-hidden"
                    style={{ height: 20, background: '#F2F1EC', borderRadius: 4 }}
                  >
                    {/* Budget bar (full height, gray) */}
                    <div
                      className="absolute top-0 left-0 h-full"
                      style={{ width: `${paidPct}%`, background: '#E0DDD6', borderRadius: 4 }}
                    />
                    {/* Paid bar (10px tall, dark, bottom-aligned) */}
                    <div
                      className="absolute bottom-0 left-0"
                      style={{ width: `${budgetPct}%`, height: 10, background: '#1C1B18', borderRadius: 2 }}
                    />
                  </div>

                  {/* Amount */}
                  <div className="text-[11px] text-text-muted tabular-nums">
                    {fCurrency(actual, currency)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div
            className="flex gap-3.5 pt-2"
            style={{ borderTop: '1px solid #F0EDE6', marginTop: 10 }}
          >
            <div className="flex items-center gap-[5px] text-[10px] text-text-muted">
              <div style={{ width: 12, height: 6, background: '#E0DDD6', borderRadius: 2 }} />
              Budget
            </div>
            <div className="flex items-center gap-[5px] text-[10px] text-text-muted">
              <div style={{ width: 12, height: 6, background: '#1C1B18', borderRadius: 2 }} />
              Actual
            </div>
          </div>
        </>
      )}
    </div>
  )
}
