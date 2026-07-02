import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconArrowLeft, IconPlus } from '@tabler/icons-react'
import { useGetExpenseById } from '@/store/queries/useExpenses'
import { useGetCeremonies } from '@/store/queries/useCeremonies'
import { useGetMe } from '@/store/queries/useAuth'
import { useDeletePayment } from '@/store/mutations/usePayments'
import { fCurrencyFull, pct } from '@/lib/format'
import { cerStyle, statusStyle, progressColor, PENDING_STYLE } from '@/lib/utils'
import { SlidePanel } from '@/components/layout/SlidePanel'
import { ExpensePanel } from './ExpensePanel'
import { PaymentPanel } from './PaymentPanel'
import { PaymentCard } from './PaymentCard'
import type { Payment } from '@/types/payment'
import type { Ceremony } from '@/types/ceremony'

interface Props { expenseId: string }

export function ExpenseDetailPage({ expenseId }: Props) {
  const [editOpen, setEditOpen]         = useState(false)
  const [paymentOpen, setPaymentOpen]   = useState(false)
  const [editPayment, setEditPayment]   = useState<Payment | null>(null)
  const navigate              = useNavigate()
  const { data: user }        = useGetMe()
  const { data: ceremonies = [] } = useGetCeremonies()
  const { data: expense, isLoading } = useGetExpenseById(expenseId)
  const deletePayment         = useDeletePayment()

  const currency = user?.base_currency ?? 'NGN'

  if (isLoading) return <div className="p-8 text-[13px] text-text-muted">Loading…</div>
  if (!expense)  return <div className="p-8 text-[13px] text-text-muted">Expense not found</div>

  const paid     = Number(expense.total_paid)
  const actual   = Number(expense.actual_amount ?? 0)
  const balance  = Number(expense.balance)
  const noAmount = !expense.actual_amount || actual === 0
  const paidPct  = pct(paid, actual)
  const barColor = progressColor(paidPct)
  const status   = noAmount ? PENDING_STYLE : statusStyle(expense.status)

  const cerIdx = (ceremonies as Ceremony[]).findIndex(c => c.id === expense.ceremony_id)
  const cer    = cerStyle(cerIdx >= 0 ? cerIdx : 0)

  return (
    <div className="px-8 py-7 flex flex-col gap-5">

      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate({ to: '/expenses' })}
        className="inline-flex items-center gap-[5px] text-[12px] cursor-pointer self-start"
        style={{ color: '#595650' }}
      >
        <IconArrowLeft size={14} />
        All expenses
      </button>

      {/* Info card — one card with top / middle / bottom sections */}
      <div className="bg-surface border border-border rounded-[10px]" style={{ padding: '20px 24px' }}>

        {/* Top: name + tags + edit button */}
        <div
          className="flex items-start justify-between gap-4"
          style={{ paddingBottom: 16, borderBottom: '1px solid #F0EDE6', marginBottom: 16 }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.3px' }}>
              {expense.name}
            </div>
            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 7 }}>
              <span
                className="inline-flex items-center rounded-full font-medium"
                style={{ padding: '2px 9px', fontSize: 11, background: cer.bg, color: cer.color, border: `1px solid ${cer.border}` }}
              >
                {expense.ceremony_name}
              </span>
              <span style={{ fontSize: 12, color: '#9B9890' }}>{expense.category_name}</span>
              <span
                className="inline-flex items-center rounded-full font-medium"
                style={{ padding: '2px 9px', fontSize: 11, background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="shrink-0 cursor-pointer"
            style={{ height: 32, padding: '0 14px', border: '1px solid #E8E6E0', borderRadius: 7, background: 'white', fontSize: 12, color: '#595650' }}
          >
            Edit expense
          </button>
        </div>

        {/* Middle: 4-col metadata */}
        <div
          className="grid grid-cols-4 gap-4"
          style={{ paddingBottom: 16, borderBottom: '1px solid #F0EDE6', marginBottom: 16 }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Vendor</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: expense.vendor_name ? '#1C1B18' : '#9B9890' }}>
              {expense.vendor_name ?? 'Not assigned'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Actual amount</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18', fontVariantNumeric: 'tabular-nums' }}>
              {actual ? fCurrencyFull(actual, currency) : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Total paid</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#3A7A5A', fontVariantNumeric: 'tabular-nums' }}>
              {paid ? fCurrencyFull(paid, currency) : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Balance</div>
            <div style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: noAmount ? '#9B9890' : balance > 0 ? '#C43C3C' : '#3A7A5A' }}>
              {noAmount ? '—' : balance > 0 ? fCurrencyFull(balance, currency) : 'Fully paid'}
            </div>
          </div>
        </div>

        {/* Bottom: progress bar */}
        <div>
          <div className="flex justify-between" style={{ fontSize: 11, color: '#9B9890', marginBottom: 6 }}>
            <span>Payment progress</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{paidPct}% paid</span>
          </div>
          <div style={{ height: 8, background: '#F2F1EC', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, background: barColor, width: `${paidPct}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

      </div>

      {/* Payment history header — outside the info card */}
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18' }}>Payment history</div>
        <button
          type="button"
          onClick={() => setPaymentOpen(true)}
          className="inline-flex items-center gap-[5px] cursor-pointer font-medium"
          style={{ height: 32, padding: '0 14px', background: '#3A7A5A', color: 'white', border: 'none', borderRadius: 7, fontSize: 12 }}
        >
          <IconPlus size={13} />
          Add payment
        </button>
      </div>

      {/* Payment cards */}
      {expense.payments.length === 0 ? (
        <div className="bg-surface border border-border rounded-[10px] flex flex-col items-center justify-center py-10 gap-2.5">
          <div style={{ fontSize: 13, color: '#9B9890' }}>No payments recorded yet.</div>
          <div style={{ fontSize: 12, color: '#C0BEB8' }}>Add the first payment above.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {expense.payments.map((payment: Payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              currency={currency}
              onEdit={() => setEditPayment(payment)}
              onDelete={() => deletePayment.mutate({ expenseId, paymentId: payment.id })}
            />
          ))}
        </div>
      )}

      <SlidePanel open={editOpen} onClose={() => setEditOpen(false)}>
        <ExpensePanel expense={expense} onClose={() => setEditOpen(false)} />
      </SlidePanel>

      <SlidePanel open={paymentOpen} onClose={() => setPaymentOpen(false)}>
        <PaymentPanel expense={expense} onClose={() => setPaymentOpen(false)} />
      </SlidePanel>

      <SlidePanel open={!!editPayment} onClose={() => setEditPayment(null)}>
        {editPayment && (
          <PaymentPanel
            expense={expense}
            payment={editPayment}
            onClose={() => setEditPayment(null)}
          />
        )}
      </SlidePanel>

    </div>
  )
}
