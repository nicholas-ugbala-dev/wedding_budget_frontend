const COLORS = ['#3A7A5A', '#B87820', '#5A4A8A', '#C43C3C', '#1C7C8C', '#8A5A2A', '#2A5C8A']

const R = 40
const C = 2 * Math.PI * R

interface DonutItem { category: string; amount: string; pct: string }
interface Props { data: DonutItem[]; isLoading: boolean }

interface Segment { category: string; pct: number; dash: number; offset: number; color: string }

function collapseToTop4(data: DonutItem[]): DonutItem[] {
  if (data.length <= 4) return data
  const sorted = [...data].sort((a, b) => Number(b.amount) - Number(a.amount))
  const top4 = sorted.slice(0, 4)
  const rest = sorted.slice(4)
  const othersAmount = rest.reduce((sum, d) => sum + Number(d.amount), 0)
  const othersPct   = rest.reduce((sum, d) => sum + Number(d.pct), 0)
  return [...top4, { category: 'Others', amount: String(othersAmount), pct: String(othersPct.toFixed(1)) }]
}

function buildSegments(data: DonutItem[]): Segment[] {
  let cumulative = 0
  return data.map((item, i) => {
    const pct = Number(item.pct)
    const dash = (pct / 100) * C
    const offset = C * 0.25 - (cumulative / 100) * C
    cumulative += pct
    return { category: item.category, pct, dash, offset, color: COLORS[i % COLORS.length] }
  })
}

export function DonutChart({ data, isLoading }: Props) {
  const segments = buildSegments(collapseToTop4(data))

  return (
    <div className="bg-surface border border-border rounded-[10px] px-5 py-[18px]">
      <div className="text-[13px] font-medium text-text-primary mb-3.5">Spend by category</div>

      {isLoading ? (
        <div className="text-[13px] text-text-muted">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-[13px] text-text-muted">No data yet</div>
      ) : (
        <div className="flex items-center gap-3.5">

          {/* Donut — 108×108 matching design canvas size */}
          <svg
            width="108" height="108"
            viewBox="0 0 100 100"
            className="-rotate-90 shrink-0"
          >
            {segments.map(seg => (
              <circle
                key={seg.category}
                cx="50" cy="50" r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeDasharray={`${seg.dash} ${C - seg.dash}`}
                strokeDashoffset={seg.offset}
              />
            ))}
            <circle cx="50" cy="50" r="28" fill="white" />
          </svg>

          {/* Legend */}
          <div className="flex flex-col gap-[7px] flex-1">
            {segments.map(seg => (
              <div key={seg.category} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className="shrink-0"
                    style={{ width: 8, height: 8, borderRadius: 2, background: seg.color }}
                  />
                  <span className="text-[11px] text-text-secondary">{seg.category}</span>
                </div>
                <span className="text-[11px] text-text-muted tabular-nums">
                  {seg.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
