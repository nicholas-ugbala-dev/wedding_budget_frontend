import { useState, useEffect, useRef } from 'react'
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
  is_base?: boolean
}

interface ClientCurrency {
  id: string         // = currency_code for planners
  currency_code: string
  is_base?: boolean
}

interface Props {
  expense: ExpenseDetail
  payment?: Payment
  onClose: () => void
}

type FormData = {
  payment_type: 'deposit' | 'balance' | 'full_payment'
  payment_date: string
  wallet_currency_id: string  // UUID for couples, currency code for planners
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
  const baseCurrency = expense.base_currency   // the currency this expense is denominated in
  const isPlanner    = user?.account_type === 'planner'

  // For planners: currencies come back as ClientCurrency[] (id = currency_code)
  // For couples: currencies come back as UserCurrency[] (id = UUID)
  const wallets = currencies as (UserCurrency | ClientCurrency)[]

  const { register, handleSubmit, watch, control, reset, setValue } = useForm<FormData>({
    defaultValues: {
      payment_type: 'deposit',
      payment_date: today(),
    },
  })

  const [walletAmount, setWalletAmount]     = useState('')
  const [exchangeRate, setExchangeRate]     = useState('')
  const [isRateFetching, setIsRateFetching] = useState(false)
  // Set to true by the edit pre-fill effect before calling reset(),
  // so the currency effect knows to skip the change triggered by reset().
  const editPreFillPending  = useRef(false)
  const defaultWalletSeeded = useRef(false)

  useEffect(() => {
    if (payment) {
      editPreFillPending.current = true
      reset({
        payment_type:       payment.payment_type,
        payment_date:       payment.payment_date.slice(0, 10),
        wallet_currency_id: isPlanner ? payment.wallet_currency_code : (payment.user_currency_id ?? ''),
        notes:              payment.notes ?? '',
      })
      setWalletAmount(String(payment.wallet_amount))
      setExchangeRate(payment.exchange_rate ? String(payment.exchange_rate) : '')
    }
  }, [payment, reset, isPlanner])

  // For new couple payments: auto-select the base wallet once currencies load
  useEffect(() => {
    if (isEdit || isPlanner || defaultWalletSeeded.current) return
    const base = (wallets as UserCurrency[]).find(w => w.is_base)
    if (base) {
      defaultWalletSeeded.current = true
      setValue('wallet_currency_id', base.id)
    }
  }, [currencies, isEdit, isPlanner])

  const selectedCurrencyId = watch('wallet_currency_id')

  // For planners: the form value IS the currency code; for couples: look up from wallet list
  const selectedWallet = !isPlanner ? (wallets as UserCurrency[]).find(w => w.id === selectedCurrencyId) : null
  const walletCode     = isPlanner ? (selectedCurrencyId || baseCurrency) : (selectedWallet?.currency_code ?? baseCurrency)
  const isForeign      = walletCode !== baseCurrency

  useEffect(() => {
    // No currency selected yet — nothing to do.
    if (!selectedCurrencyId) return
    // The re-render triggered by reset() in edit pre-fill — skip it.
    if (editPreFillPending.current) {
      editPreFillPending.current = false
      return
    }

    setWalletAmount('')
    setExchangeRate('')
    if (!isForeign || walletCode === baseCurrency) return

    const controller = new AbortController()
    setIsRateFetching(true)
    fetch(`https://open.er-api.com/v6/latest/${walletCode}`, { signal: controller.signal })
      .then(r => r.json())
      .then((d: { rates?: Record<string, number> }) => {
        const rate = d?.rates?.[baseCurrency]
        if (rate != null) setExchangeRate(parseFloat(rate.toFixed(6)).toString())
      })
      .catch(() => {})
      .finally(() => setIsRateFetching(false))
    return () => controller.abort()
  }, [selectedCurrencyId])

  const baseEquivalent = isForeign && walletAmount && exchangeRate
    ? Math.round(Number(walletAmount) * Number(exchangeRate))
    : null

  function onSubmit(data: FormData) {
    // Build the wallet currency field based on account type
    const walletField = isPlanner
      ? { wallet_currency_code: data.wallet_currency_id.toUpperCase() }
      : { user_currency_id: data.wallet_currency_id }

    if (isEdit && payment) {
      const updatePayload: Record<string, unknown> = {
        expenseId:    expense.id,
        paymentId:    payment.id,
        payment_type: data.payment_type,
        payment_date: data.payment_date,
        ...walletField,
        notes:        data.notes || null,
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
        expenseId:    expense.id,
        payment_type: data.payment_type,
        payment_date: data.payment_date,
        ...walletField,
        notes:        data.notes || undefined,
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

  // Build select options — same shape for both flows since planner uses code as id
  const walletOptions = wallets.map(w => ({
    value: w.id,
    label: w.is_base ? `${w.currency_code} (base)` : w.currency_code,
  }))

  return (
    <div
      style={{
        width: 480,
        background: 'white',
        borderRadius: 12,
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeUp 0.2s ease',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '22px 28px',
          borderBottom: '1px solid #F0EDE6',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1C1B18' }}>
            {isEdit ? 'Edit payment' : 'Add payment'}
          </div>
          <div style={{ fontSize: 12, color: '#9B9890', marginTop: 2 }}>
            Record a payment against this expense
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 30, height: 30,
            border: '1px solid #E8E6E0',
            borderRadius: 7, background: 'white',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconX size={14} color="#595650" />
        </button>
      </div>

      {/* Context bar */}
      <div
        style={{
          padding: '10px 28px',
          background: '#FAFAF8',
          borderBottom: '1px solid #F0EDE6',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18' }}>{expense.name}</span>
          {vendorLine && <span style={{ fontSize: 12, color: '#9B9890' }}>{vendorLine}</span>}
        </div>
        {!noAmount && (
          <span style={{
            background: balance > 0 ? '#FDF0F0' : '#EEF5F1',
            color: balance > 0 ? '#C43C3C' : '#2A5C41',
            borderRadius: 100,
            padding: '3px 10px',
            fontSize: 12,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}>
            {balance > 0 ? fCurrencyFull(balance, baseCurrency) : 'Fully paid'}
          </span>
        )}
      </div>

      {/* Form body */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}
      >

        {/* PAYMENT section */}
        <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Payment
        </div>

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

        {/* WHERE THE MONEY CAME FROM section */}
        <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 4 }}>
          Where the money came from
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
                options={walletOptions}
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

        {/* Currency conversion */}
        {isForeign ? (
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
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <IconExchange size={13} />
              Currency conversion
            </div>
            <p style={{ fontSize: 12, color: '#B87820', margin: '0 0 12px' }}>
              Enter the exact rate from your app at the time of payment — it's locked to this record forever.
            </p>

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
                {isRateFetching ? (
                  <div className="animate-pulse" style={{ height: 34, borderRadius: 6, background: '#EDD9A3' }} />
                ) : (
                  <input
                    type="number"
                    placeholder="0.000000"
                    value={exchangeRate}
                    onChange={e => setExchangeRate(e.target.value)}
                    style={subInputStyle}
                  />
                )}
                <span style={{ fontSize: 10, color: '#9B9890' }}>
                  {isRateFetching ? 'Fetching live rate…' : 'Live rate pre-filled — edit to your exact app rate'}
                </span>
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
        ) : (
          selectedCurrencyId && (
            <div style={{ fontSize: 12, fontStyle: 'italic', color: '#9B9890' }}>
              Not applicable — payment made directly in base currency
            </div>
          )
        )}

        {/* Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Notes</label>
          <input {...register('notes')} placeholder="Reminders or context…" style={inputStyle} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, paddingBottom: 8 }}>
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
