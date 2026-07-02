import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { AppSelect } from './AppSelect'
import type { PaginationMeta } from '@/types/pagination'

interface Props {
  pagination: PaginationMeta
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  limitOptions?: number[]
}

function buildPageButtons(current: number, total: number) {
  const cur = Number(current)
  const tot = Number(total)
  const set = new Set([1, tot, cur, cur - 1, cur + 1])
  const pages = [...set].filter(p => p >= 1 && p <= tot).sort((a, b) => a - b)
  const buttons: { label: string; page: number; isEllipsis: boolean }[] = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) buttons.push({ label: '…', page: -1, isEllipsis: true })
    buttons.push({ label: String(p), page: p, isEllipsis: false })
  })
  return buttons
}

export function Pagination({ pagination: pg, limit, onPageChange, onLimitChange, limitOptions = [10, 25, 50] }: Props) {
  const page  = Number(pg.page)
  const total = Number(pg.total)
  const lim   = Number(pg.limit)
  const from  = total === 0 ? 0 : (page - 1) * lim + 1
  const to    = Math.min(page * lim, total)

  return (
    <div
      className="bg-surface border border-border rounded-[10px] flex items-center justify-between"
      style={{ padding: '10px 16px' }}
    >
      {/* Left: rows per page + count */}
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, color: '#9B9890' }}>Rows per page</span>
        <div style={{ width: 64 }}>
          <AppSelect
            value={String(limit)}
            onChange={v => onLimitChange(Number(v))}
            options={limitOptions.map(n => ({ value: String(n), label: String(n) }))}
            style={{ height: 28, borderRadius: 5, fontSize: 12 }}
          />
        </div>
        <span style={{ fontSize: 12, color: '#9B9890' }}>
          {total === 0 ? '0' : `${from}–${to}`} of {total}
        </span>
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!pg.has_prev}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default"
          style={{ width: 28, height: 28, border: '1px solid #E8E6E0', borderRadius: 5, background: 'white', color: '#595650' }}
        >
          <IconChevronLeft size={13} />
        </button>

        {buildPageButtons(page, Number(pg.total_pages)).map((btn, i) => (
          <button
            key={i}
            type="button"
            disabled={btn.isEllipsis}
            onClick={() => !btn.isEllipsis && onPageChange(btn.page)}
            className="cursor-pointer disabled:cursor-default"
            style={{
              minWidth: 28, height: 28, padding: '0 6px',
              border: `1px solid ${btn.page === page ? '#1C1B18' : '#E8E6E0'}`,
              borderRadius: 5,
              background: btn.page === page ? '#1C1B18' : 'white',
              color: btn.page === page ? 'white' : btn.isEllipsis ? '#C0BEB8' : '#595650',
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            {btn.label}
          </button>
        ))}

        <button
          type="button"
          disabled={!pg.has_next}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default"
          style={{ width: 28, height: 28, border: '1px solid #E8E6E0', borderRadius: 5, background: 'white', color: '#595650' }}
        >
          <IconChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
