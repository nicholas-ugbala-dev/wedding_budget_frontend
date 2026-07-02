import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { IconX, IconExchange, IconLock } from '@tabler/icons-react'
import { useGetCurrencies } from '@/store/queries/useCurrencies'
import { useGetMe } from '@/store/queries/useAuth'
import { useCreatePayment, useUpdatePayment } from '@/store/mutations/usePayments'
import { fCurrencyFull } from '@/lib/format'
import { AppSelect } from '@/components/ui/AppSelect'
import type { ExpenseDetail } from '@/types/expense'
import type { Payment } from '@/types/payment'

interface UserCurrency {
  id: string
  currency_code: string
}

interface Props {
  expense: ExpenseDetail
  payment?: Payment
  onClose: () => void
}

type FormData = {
  payment_type: 'deposit' | 'balance' | 'full_payment'
  payment_date: string
  wallet_currency_id: string
  notes: string
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#595650',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const inputStyle: React.CSSProperties = {
  height: 38,
  border: '1px solid #E8E6E0',
  borderRadius: 7,
  padding: '0 12px',
  fontSize: 13,
  background: '#FAFAF8',
  color: '#1C1B18',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const subInputStyle: React.CSSProperties = {
  height: 34,
  border: '1px solid #E8E6E0',
  borderRadius: 6,
  padding: '0 10px',
  fontSize: 12,
  background: 'white',
  color: '#1C1B18',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function PaymentPanel({ expense, payment, onClose }: Props) {
  const { data: user }            = useGetMe()
  const { data: currencies = [] } = useGetCurrencies()
  const createPayment             = useCreatePayment()
  const updatePayment             = useUpdatePayment()

  const isEdit       = !!payment
  const baseCurrency = user?.base_currency ?? 'NGN'
  const wallets      = currencies as UserCurrency[]

  const { register, handleSubmit, watch, control, reset } = useForm<FormData>({
    defaultValues: {
      payment_type: 'deposit',
      payment_date: today(),
    },
  })

  const [walletAmount, setWalletAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState('')

  useEffect(() => {
    if (payment) {
      reset({
        payment_type:       payment.payment_type,
        payment_date:       payment.payment_date.slice(0, 10),
        wallet_currency_id: payment.user_currency_id,
        notes:              payment.notes ?? '',
      })
      setWalletAmount(String(payment.wallet_amount))
      setExchangeRate(payment.exchange_rate ? String(payment.exchange_rate) : '')
    }
  }, [payment, reset])

  const selectedCurrencyId = watch('wallet_currency_id')
  const selectedWallet     = wallets.find(w => w.id === selectedCurrencyId)
  const walletCode         = selectedWallet?.currency_code ?? baseCurrency
  const isForeign          = walletCode !== baseCurrency

  const baseEquivalent = isForeign && walletAmount && exchangeRate
    ? Math.round(Number(walletAmount) * Number(exchangeRate))
    : null

  function onSubmit(data: FormData) {
    if (isEdit && payment) {
      const updatePayload: Record<string, unknown> = {
        expenseId:        expense.id,
        paymentId:        payment.id,
        payment_type:     data.payment_type,
        payment_date:     data.payment_date,
        user_currency_id: data.wallet_currency_id,
        notes:            data.notes || null,
      }

      if (isForeign) {
        updatePayload.wallet_amount = Number(walletAmount)
        updatePayload.exchange_rate = Number(exchangeRate)
        updatePayload.base_amount   = baseEquivalent
      } else {
        updatePayload.wallet_amount = Number(walletAmount)
        updatePayload.base_amount   = Number(walletAmount)
      }

      updatePayment.mutate(updatePayload as Parameters<typeof updatePayment.mutate>[0], { onSuccess: onClose })
    } else {
      const createPayload: Record<string, unknown> = {
        expenseId:        expense.id,
        payment_type:     data.payment_type,
        payment_date:     data.payment_date,
        user_currency_id: data.wallet_currency_id,
        notes:            data.notes || undefined,
      }

      if (isForeign) {
        createPayload.wallet_amount = Number(walletAmount)
        createPayload.exchange_rate = Number(exchangeRate)
        createPayload.base_amount   = baseEquivalent
      } else {
        createPayload.wallet_amount = Number(walletAmount)
        createPayload.base_amount   = Number(walletAmount)
      }

      createPayment.mutate(createPayload as Parameters<typeof createPayment.mutate>[0], { onSuccess: onClose })
    }
  }

  const isPending  = isEdit ? updatePayment.isPending : createPayment.isPending
  const balance    = Number(expense.balance)
  const noAmount   = !expense.actual_amount || Number(expense.actual_amount) === 0
  const vendorLine = expense.vendor_name ? ` · ${expense.vendor_name}` : ''

  return (
    <div
      style={{
        width: 440,
        height: '100vh',
        background: 'white',
        borderLeft: '1px solid #E8E6E0',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.22s ease',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #F0EDE6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1C1B18' }}>
          {isEdit ? 'Edit payment' : 'Add payment'}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 28, height: 28,
            border: '1px solid #E8E6E0',
            borderRadius: 6, background: 'white',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <IconX size={14} color="#595650" />
        </button>
      </div>

      {/* Context bar */}
      <div
        style={{
          padding: '10px 24px',
          background: '#FAFAF8',
          borderBottom: '1px solid #F0EDE6',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18' }}>{expense.name}</span>
        <span style={{ fontSize: 12, color: '#9B9890' }}>{vendorLine} · Balance: </span>
        <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: noAmount ? '#9B9890' : '#C43C3C' }}>
          {noAmount ? '—' : balance > 0 ? fCurrencyFull(balance, baseCurrency) : 'Fully paid'}
        </span>
      </div>

      {/* Form body */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}
      >

        {/* Payment type + Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Payment type</label>
            <Controller
              control={control}
              name="payment_type"
              render={({ field }) => (
                <AppSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={[
                    { value: 'deposit',      label: 'Deposit' },
                    { value: 'balance',      label: 'Balance' },
                    { value: 'full_payment', label: 'Full payment' },
                  ]}
                />
              )}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Payment date</label>
            <input type="date" {...register('payment_date', { required: true })} style={inputStyle} />
          </div>
        </div>

        {/* Source wallet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Source wallet</label>
          <Controller
            control={control}
            name="wallet_currency_id"
            rules={{ required: true }}
            render={({ field }) => (
              <AppSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="Select wallet…"
                options={wallets.map(w => ({
                  value: w.id,
                  label: w.currency_code === baseCurrency
                    ? `${w.currency_code} (base)`
                    : w.currency_code,
                }))}
              />
            )}
          />
        </div>

        {/* Amount paid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Amount paid</label>
          <input
            type="number"
            placeholder="0"
            value={walletAmount}
            onChange={e => setWalletAmount(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Currency conversion — foreign wallets only */}
        {isForeign && (
          <div
            style={{
              background: '#FFFBF3',
              border: '1px solid #EDD9A3',
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#B87820',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <IconExchange size={13} />
              Currency conversion
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: '#595650', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {walletCode} amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={walletAmount}
                  onChange={e => setWalletAmount(e.target.value)}
                  style={subInputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: '#595650', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Exchange rate
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1520"
                  value={exchangeRate}
                  onChange={e => setExchangeRate(e.target.value)}
                  style={subInputStyle}
                />
                <span style={{ fontSize: 10, color: '#9B9890' }}>Exact rate from your app</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: '#595650', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {baseCurrency} equivalent
                </label>
                <input
                  readOnly
                  value={baseEquivalent != null ? String(baseEquivalent) : ''}
                  placeholder="Auto-calculated"
                  style={{ ...subInputStyle, background: '#F2F1EC', color: '#9B9890' }}
                />
                {baseEquivalent != null && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#B87820', fontWeight: 600 }}>
                    <IconLock size={10} /> Rate locked
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Notes</label>
          <input {...register('notes')} placeholder="Reminders or context…" style={inputStyle} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'auto' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 36, padding: '0 16px',
              border: '1px solid #E8E6E0',
              borderRadius: 7, background: 'white',
              fontSize: 13, color: '#595650',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            style={{
              height: 36, padding: '0 18px',
              background: isPending ? '#555' : '#1C1B18',
              color: 'white', border: 'none',
              borderRadius: 7, fontSize: 13,
              fontWeight: 500, cursor: isPending ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {isPending ? 'Saving…' : isEdit ? 'Update payment' : 'Save payment'}
          </button>
        </div>

      </form>
    </div>
  )
}
