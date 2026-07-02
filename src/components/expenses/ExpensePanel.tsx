import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { IconX } from '@tabler/icons-react'
import { useGetCeremonies } from '@/store/queries/useCeremonies'
import { useGetMe } from '@/store/queries/useAuth'
import { useCreateExpense } from '@/store/mutations/useExpenses'
import { useUpdateExpense } from '@/store/mutations/useExpenses'
import { CategoryCombobox } from './CategoryCombobox'
import { AppSelect } from '@/components/ui/AppSelect'
import type { CategoryValue } from './CategoryCombobox'
import type { CreateExpenseInput } from '@/validations/expense'
import type { Expense } from '@/types/expense'
import type { Ceremony } from '@/types/ceremony'

interface Props {
  expense?: Expense
  onClose: () => void
}

type FormData = {
  name: string
  ceremony_id: string
  vendor_name: string
  vendor_phone: string
  vendor_email: string
  actual_amount: string
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
  const { data: user }         = useGetMe()
  const { data: ceremonies = [] } = useGetCeremonies()
  const createExpense          = useCreateExpense()
  const updateExpense          = useUpdateExpense()

  const isEdit    = !!expense
  const isPending = createExpense.isPending || updateExpense.isPending
  const currency  = user?.base_currency ?? 'NGN'

  const [category, setCategory] = useState<CategoryValue>(() => ({
    id:   expense?.category_id   ?? undefined,
    name: expense?.category_name ?? '',
  }))

  const { register, handleSubmit, reset, control } = useForm<FormData>({
    defaultValues: expense ? {
      name:             expense.name,
      ceremony_id:      expense.ceremony_id,
      vendor_name:      expense.vendor_name ?? '',
      vendor_phone:     '',
      vendor_email:     '',
      actual_amount:    expense.actual_amount != null ? String(expense.actual_amount) : '',
      notes:            expense.notes ?? '',
      payment_deadline: expense.payment_deadline?.slice(0, 10) ?? '',
    } : undefined,
  })

  useEffect(() => {
    if (expense) reset({
      name:             expense.name,
      ceremony_id:      expense.ceremony_id,
      vendor_name:      expense.vendor_name ?? '',
      vendor_phone:     '',
      vendor_email:     '',
      actual_amount:    expense.actual_amount != null ? String(expense.actual_amount) : '',
      notes:            expense.notes ?? '',
      payment_deadline: expense.payment_deadline?.slice(0, 10) ?? '',
    })
  }, [expense, reset])

  function onSubmit(data: FormData) {
    const hasAmount = !!data.actual_amount && Number(data.actual_amount) > 0
    const base = {
      name:             data.name,
      ceremony_id:      data.ceremony_id,
      vendor_name:      data.vendor_name  || undefined,
      vendor_phone:     data.vendor_phone || undefined,
      vendor_email:     data.vendor_email || undefined,
      actual_amount:    hasAmount ? Number(data.actual_amount) : undefined,
      notes:            data.notes        || undefined,
      payment_deadline: data.payment_deadline || undefined,
      is_planned:       !hasAmount,
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
          category_id:   category.id || undefined,
          category_name: !category.id ? category.name.trim() || undefined : undefined,
        } as CreateExpenseInput,
        { onSuccess: onClose },
      )
    }
  }

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
          {isEdit ? 'Edit expense' : 'Add expense'}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 28, height: 28,
            border: '1px solid #E8E6E0',
            borderRadius: 6,
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconX size={14} color="#595650" />
        </button>
      </div>

      {/* Form body */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}
      >

        {/* Expense name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Expense name</label>
          <input {...register('name', { required: true })} placeholder="e.g. Photographer" style={inputStyle} />
        </div>

        {/* Ceremony + Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Ceremony</label>
            <Controller
              control={control}
              name="ceremony_id"
              rules={{ required: true }}
              render={({ field }) => (
                <AppSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Select…"
                  options={(ceremonies as Ceremony[]).map(c => ({ value: c.id, label: c.name }))}
                />
              )}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Category</label>
            <CategoryCombobox
              value={category}
              onChange={setCategory}
              allowCreate={!isEdit}
            />
          </div>
        </div>

        {/* Vendor name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Vendor name</label>
          <input {...register('vendor_name')} placeholder="e.g. Panashe Events" style={inputStyle} />
        </div>

        {/* Phone + Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Phone</label>
            <input {...register('vendor_phone')} placeholder="+1 555 …" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" {...register('vendor_email')} placeholder="vendor@…" style={inputStyle} />
          </div>
        </div>

        {/* Amount + Currency */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Amount</label>
            <input type="number" {...register('actual_amount')} placeholder="0" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Currency</label>
            <div
              style={{
                ...inputStyle,
                display: 'flex',
                alignItems: 'center',
                color: '#9B9890',
                cursor: 'default',
              }}
            >
              {currency}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Notes</label>
          <input {...register('notes')} placeholder="Agreements, reminders…" style={inputStyle} />
        </div>

        {/* Payment deadline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={labelStyle}>Final payment deadline</label>
          <input type="date" {...register('payment_deadline')} style={inputStyle} />
          <span style={{ fontSize: 11, color: '#9B9890' }}>The date by which full payment must be made</span>
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
            {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Save expense'}
          </button>
        </div>

      </form>
    </div>
  )
}
