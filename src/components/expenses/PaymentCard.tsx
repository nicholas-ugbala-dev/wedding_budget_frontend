import { IconCheck, IconLock, IconPencil, IconTrash } from '@tabler/icons-react'
import { fCurrencyFull, fDate } from '@/lib/format'
import { CURRENCY_META } from '@/lib/format'
import type { Payment } from '@/types/payment'

const PAYMENT_TYPE: Record<string, { label: string; bg: string; color: string }> = {
  deposit:      { label: 'Deposit',      bg: '#F0EEE9', color: '#595650' },
  balance:      { label: 'Balance',      bg: '#FDF5E6', color: '#92600A' },
  full_payment: { label: 'Full payment', bg: '#EEF5F1', color: '#2A5C41' },
}

interface Props {
  payment: Payment
  currency: string
  onEdit: () => void
  onDelete: () => void
}

export function PaymentCard({ payment, currency, onEdit, onDelete }: Props) {
  const pt        = PAYMENT_TYPE[payment.payment_type] ?? PAYMENT_TYPE.deposit
  const isForeign = payment.wallet_currency_code !== currency
  const walletMeta = CURRENCY_META[payment.wallet_currency_code] ?? { name: payment.wallet_currency_code }

  const rateDisplay = isForeign && payment.exchange_rate
    ? `1 ${payment.wallet_currency_code} = ${fCurrencyFull(payment.exchange_rate, currency)}`
    : null

  return (
    <div className="group bg-surface border border-border rounded-[10px] overflow-hidden">

      {/* Top: type badge + wallet badge left — base amount right */}
      <div
        className="relative flex items-center justify-between px-[18px] py-[14px]"
        style={{ borderBottom: '1px solid #F0EDE6' }}
      >
        <div className="flex items-center gap-[7px]">
          <span
            className="text-[11px] font-medium px-[9px] py-[3px] rounded-full"
            style={{ background: pt.bg, color: pt.color }}
          >
            {pt.label}
          </span>
          <span
            className="text-[11px] font-medium px-[9px] py-[3px] rounded-full"
            style={{ background: '#F0EEE9', color: '#595650', border: '1px solid #DDD9D3' }}
          >
            {payment.wallet_currency_code}
          </span>

          {/* Edit + Delete — visible on card hover */}
          <button
            type="button"
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-2 rounded"
            style={{ color: '#595650' }}
          >
            <IconPencil size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-2 rounded"
            style={{ color: '#C43C3C' }}
          >
            <IconTrash size={15} />
          </button>
        </div>

        <div style={{ fontSize: 20, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.3px', fontVariantNumeric: 'tabular-nums' }}>
          {fCurrencyFull(payment.base_amount, currency)}
        </div>
      </div>

      {/* Bottom: 3-col grid — 6 fields */}
      <div className="px-[18px] py-[14px] grid grid-cols-3 gap-[14px]">
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
            Payment date
          </div>
          <div style={{ fontSize: 13, color: '#1C1B18' }}>{fDate(payment.payment_date)}</div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
            Source wallet
          </div>
          <div style={{ fontSize: 13, color: '#1C1B18' }}>{walletMeta.name}</div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
            Wallet amount
          </div>
          <div style={{ fontSize: 13, color: '#1C1B18', fontVariantNumeric: 'tabular-nums' }}>
            {fCurrencyFull(payment.wallet_amount, payment.wallet_currency_code)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
            Exchange rate
          </div>
          <div style={{ fontSize: 13, color: rateDisplay ? '#92600A' : '#C0BEB8', fontStyle: rateDisplay ? 'normal' : 'italic', fontVariantNumeric: 'tabular-nums' }}>
            {rateDisplay ?? 'Not applicable'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
            Base equivalent
          </div>
          <div style={{ fontSize: 13, color: '#3A7A5A', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {fCurrencyFull(payment.base_amount, currency)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
            Notes
          </div>
          <div style={{ fontSize: 13, color: payment.notes ? '#1C1B18' : '#C0BEB8', fontStyle: payment.notes ? 'normal' : 'italic' }}>
            {payment.notes ?? '—'}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div
        className="flex items-center justify-between px-[18px] py-2"
        style={{ background: '#FAFAF8', borderTop: '1px solid #F0EDE6' }}
      >
        {isForeign ? (
          <>
            <span style={{ fontSize: 11, color: '#9B9890' }}>Rate locked to this payment</span>
            <div className="flex items-center gap-1" style={{ fontSize: 11, color: '#92600A', fontWeight: 500 }}>
              <IconLock size={12} />
              {fCurrencyFull(payment.exchange_rate, currency)} · {fDate(payment.payment_date)}
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 11, color: '#9B9890' }}>Paid directly in base currency</span>
            <div className="flex items-center gap-1" style={{ fontSize: 11, color: '#3A7A5A', fontWeight: 500 }}>
              <IconCheck size={12} />
              {currency} · no conversion
            </div>
          </>
        )}
      </div>

    </div>
  )
}
