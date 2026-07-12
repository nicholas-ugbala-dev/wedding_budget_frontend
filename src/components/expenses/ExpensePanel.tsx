import { useState, useEffect, useMemo, useRef } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { IconX } from '@tabler/icons-react'
import { useGetEvents } from '@/store/queries/useEvents'
import { useBaseCurrency } from '@/store/queries/useBaseCurrency'
import { useGetCurrencies } from '@/store/queries/useCurrencies'
import { useGetVendors } from '@/store/queries/useVendors'
import { useCreateExpense } from '@/store/mutations/useExpenses'
import { useUpdateExpense } from '@/store/mutations/useExpenses'
import { CategoryCombobox } from './CategoryCombobox'
import { VendorCombobox } from './VendorCombobox'
import { AppSelect } from '@/components/ui/AppSelect'
import type { CategoryValue } from './CategoryCombobox'
import type { VendorValue } from './VendorCombobox'
import type { CreateExpenseInput } from '@/validations/expense'
import type { Expense } from '@/types/expense'
import type { Vendor } from '@/types/vendor'
import type { Event } from '@/types/event'

interface Props {
  expense?: Expense
  onClose: () => void
}

type FormData = {
  name: string
  event_id: string
  base_currency: string
  actual_amount: string
  refundable_amount: string
  notes: string
  payment_deadline: string
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

export function ExpensePanel({ expense, onClose }: Props) {
  const { data: events = [] } = useGetEvents()
  const { data: wallets = [] } = useGetCurrencies()
  const { data: vendorList = [] } = useGetVendors()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const isEdit = !!expense
  const isPending = createExpense.isPending || updateExpense.isPending
  const isAmountLocked = isEdit && Number(expense?.total_paid ?? 0) > 0
  const fallbackCurrency = useBaseCurrency()

  const [category, setCategory] = useState<CategoryValue>(() => ({
    id: expense?.category_id ?? undefined,
    name: expense?.category_name ?? '',
  }))

  const [vendor, setVendor] = useState<VendorValue>(() => ({
    id: expense?.vendor_id ?? undefined,
    name: expense?.vendor_name ?? '',
    phone: '',
    email: '',
  }))

  // Keep a ref to the latest vendor list so the expense-change effect can read it
  // without needing to re-run every time vendors refetch in the background
  const vendorListRef = useRef(vendorList)
  vendorListRef.current = vendorList

  const { register, handleSubmit, reset, control, setValue } = useForm<FormData>({
    defaultValues: expense
      ? {
          name: expense.name,
          event_id: expense.event_id,
          base_currency: expense.base_currency,
          actual_amount: expense.actual_amount != null ? String(expense.actual_amount) : '',
          refundable_amount:
            expense.refundable_amount != null ? String(expense.refundable_amount) : '',
          notes: expense.notes ?? '',
          payment_deadline: expense.payment_deadline?.slice(0, 10) ?? '',
        }
      : undefined,
  })

  // Sync form + category + vendor when the expense being edited changes
  useEffect(() => {
    if (expense) {
      reset({
        name: expense.name,
        event_id: expense.event_id,
        base_currency: expense.base_currency,
        actual_amount: expense.actual_amount != null ? String(expense.actual_amount) : '',
        refundable_amount:
          expense.refundable_amount != null ? String(expense.refundable_amount) : '',
        notes: expense.notes ?? '',
        payment_deadline: expense.payment_deadline?.slice(0, 10) ?? '',
      })
      setCategory({ id: expense.category_id, name: expense.category_name })

      // Look up vendor contact info using the ref (latest cached vendors, no stale closure)
      const found = expense.vendor_id
        ? (vendorListRef.current as Vendor[]).find(v => v.id === expense.vendor_id)
        : null
      setVendor({
        id: expense.vendor_id ?? undefined,
        name: found?.name ?? expense.vendor_name ?? '',
        phone: found?.phone ?? '',
        email: found?.email ?? '',
      })
    } else {
      setVendor({ id: undefined, name: '', phone: '', email: '' })
    }
  }, [expense, reset])

  const watchedEventId = useWatch({ control, name: 'event_id' })
  const selectedEvent = useMemo(
    () => (events as Event[]).find(e => e.id === watchedEventId) ?? null,
    [events, watchedEventId],
  )

  // When event changes in create mode, default base_currency to the event's vendor_currency
  useEffect(() => {
    if (!isEdit && selectedEvent?.vendor_currency) {
      setValue('base_currency', selectedEvent.vendor_currency)
    }
  }, [isEdit, selectedEvent, setValue])

  // Currency options: event vendor_currency first, then client/user wallets — deduplicated
  const currencyOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: { value: string; label: string }[] = []
    const add = (code: string) => {
      if (!seen.has(code)) {
        seen.add(code)
        opts.push({ value: code, label: code })
      }
    }
    if (selectedEvent?.vendor_currency) add(selectedEvent.vendor_currency)
    wallets.forEach((w: { currency_code: string }) => add(w.currency_code))
    return opts
  }, [selectedEvent, wallets])

  const selectedCurrency = useWatch({ control, name: 'base_currency' }) || fallbackCurrency

  function buildVendorPayload() {
    if (vendor.id) {
      // Existing vendor selected from combobox — send id directly, skip findOrCreate
      return { vendor_id: vendor.id }
    }
    if (vendor.name.trim()) {
      // New name typed — backend will findOrCreate
      return {
        vendor_name: vendor.name.trim(),
        vendor_phone: vendor.phone || undefined,
        vendor_email: vendor.email || undefined,
      }
    }
    // Vendor name cleared — explicitly remove vendor if one was previously linked
    if (isEdit && expense?.vendor_id) {
      return { vendor_id: null }
    }
    return {}
  }

  function onSubmit(data: FormData) {
    const hasAmount = !!data.actual_amount && Number(data.actual_amount) > 0
    const base = {
      name: data.name,
      event_id: data.event_id,
      base_currency: data.base_currency || fallbackCurrency,
      actual_amount: hasAmount ? Number(data.actual_amount) : undefined,
      refundable_amount: data.refundable_amount ? Number(data.refundable_amount) : undefined,
      notes: data.notes || undefined,
      payment_deadline: data.payment_deadline || undefined,
      is_planned: !hasAmount,
      ...buildVendorPayload(),
    }

    if (isEdit && expense) {
      updateExpense.mutate(
        { id: expense.id, ...base, category_id: category.id || undefined },
        { onSuccess: onClose },
      )
    } else {
      createExpense.mutate(
        {
          ...base,
          category_id: category.id || undefined,
          category_name: !category.id ? category.name.trim() || undefined : undefined,
        } as CreateExpenseInput,
        { onSuccess: onClose },
      )
    }
  }

  return (
    <div
      style={{
        width: 560,
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
            {isEdit ? 'Edit expense' : 'Add expense'}
          </div>
          <div style={{ fontSize: 12, color: '#9B9890', marginTop: 2 }}>
            Track what it costs and who's providing it
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 30,
            height: 30,
            border: '1px solid #E8E6E0',
            borderRadius: 7,
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconX size={14} color="#595650" />
        </button>
      </div>

      {/* Form body */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        {/* EXPENSE section */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#9B9890',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          Expense
        </div>

        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Expense name</label>
          <input
            {...register('name', { required: true })}
            placeholder="e.g. Photographer"
            style={inputStyle}
          />
        </div>

        {/* Event + Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Event</label>
            <Controller
              control={control}
              name="event_id"
              rules={{ required: true }}
              render={({ field }) => (
                <AppSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Select…"
                  options={(events as Event[]).map(e => ({ value: e.id, label: e.name }))}
                />
              )}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Category</label>
            <CategoryCombobox value={category} onChange={setCategory} allowCreate={!isEdit} />
          </div>
        </div>

        {/* COST section */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#9B9890',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginTop: 4,
          }}
        >
          Cost
        </div>

        {/* Vendor currency */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Vendor currency</label>
          <div style={isAmountLocked ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
            <Controller
              control={control}
              name="base_currency"
              rules={{ required: true }}
              render={({ field }) => (
                <AppSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Select currency…"
                  options={currencyOptions}
                />
              )}
            />
          </div>
          {isAmountLocked ? (
            <span style={{ fontSize: 11, color: '#C09050' }}>
              Locked — a payment has been recorded
            </span>
          ) : (
            <span style={{ fontSize: 11, color: '#9B9890' }}>
              The currency this vendor invoices in — determines when exchange rates are needed
            </span>
          )}
        </div>

        {/* Amount | Refundable | Deadline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Amount</label>
            <div style={{ display: 'flex' }}>
              <input
                type="number"
                {...register('actual_amount')}
                placeholder="0"
                disabled={isAmountLocked}
                style={{
                  ...inputStyle,
                  borderRadius: '7px 0 0 7px',
                  borderRight: 0,
                  opacity: isAmountLocked ? 0.5 : 1,
                }}
              />
              <div
                style={{
                  height: 38,
                  border: '1px solid #E8E6E0',
                  borderLeft: 0,
                  borderRadius: '0 7px 7px 0',
                  padding: '0 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#F2F1EC',
                  color: '#9B9890',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {selectedCurrency}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Refundable</label>
            <div style={{ display: 'flex' }}>
              <input
                type="number"
                {...register('refundable_amount')}
                placeholder="0"
                style={{ ...inputStyle, borderRadius: '7px 0 0 7px', borderRight: 0 }}
              />
              <div
                style={{
                  height: 38,
                  border: '1px solid #E8E6E0',
                  borderLeft: 0,
                  borderRadius: '0 7px 7px 0',
                  padding: '0 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#F2F1EC',
                  color: '#9B9890',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {selectedCurrency}
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#9B9890' }}>
              Deposit or caution fee you expect back
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Payment deadline</label>
            <input type="date" {...register('payment_deadline')} style={inputStyle} />
            <span style={{ fontSize: 11, color: '#9B9890' }}>When full payment is due</span>
          </div>
        </div>

        {/* VENDOR section */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#9B9890',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginTop: 4,
          }}
        >
          Vendor
        </div>

        {/* Vendor name combobox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Vendor name</label>
          <VendorCombobox value={vendor} onChange={setVendor} />
        </div>

        {/* Phone + Email — prefilled when an existing vendor is selected */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Phone</label>
            <input
              value={vendor.phone}
              onChange={e => setVendor(v => ({ ...v, phone: e.target.value }))}
              placeholder="+1 555 …"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={vendor.email}
              onChange={e => setVendor(v => ({ ...v, email: e.target.value }))}
              placeholder="vendor@…"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Notes</label>
          <input {...register('notes')} placeholder="Agreements, reminders…" style={inputStyle} />
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            paddingTop: 4,
            paddingBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 36,
              padding: '0 16px',
              border: '1px solid #E8E6E0',
              borderRadius: 7,
              background: 'white',
              fontSize: 13,
              color: '#595650',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            style={{
              height: 36,
              padding: '0 18px',
              background: isPending ? '#555' : '#1C1B18',
              color: 'white',
              border: 'none',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              cursor: isPending ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Save expense'}
          </button>
        </div>
      </form>
    </div>
  )
}
