import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetMe } from '@/store/queries/useAuth'
import { useUpdateAccount } from '@/store/mutations/useSettings'

type AccountForm = {
  event_name: string
  event_date: string
  wedding_location: string
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#9B9890',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 6,
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  height: 36,
  width: '100%',
  border: '1px solid #E8E6E0',
  borderRadius: 7,
  padding: '0 12px',
  fontSize: 13,
  color: '#1C1B18',
  background: 'white',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

export function AccountTab() {
  const { data: user }  = useGetMe()
  const update          = useUpdateAccount()
  const { register, handleSubmit, reset } = useForm<AccountForm>()

  useEffect(() => {
    if (user) {
      reset({
        event_name:       user.event_name       ?? '',
        event_date:       user.event_date?.slice(0, 10) ?? '',
        wedding_location: user.wedding_location ?? '',
      })
    }
  }, [user, reset])

  return (
    <form onSubmit={handleSubmit(data => update.mutate(data))} className="flex flex-col gap-4">

      <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18', marginBottom: 4 }}>Account settings</div>

      <div>
        <label style={labelStyle}>Event name</label>
        <input {...register('event_name')} placeholder="e.g. Munachi & Bello Wedding" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Event date</label>
        <input type="date" {...register('event_date')} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Wedding location</label>
        <input {...register('wedding_location')} placeholder="e.g. Lagos, Nigeria" style={inputStyle} />
      </div>

      <div className="flex justify-end" style={{ marginTop: 4, paddingTop: 16, borderTop: '1px solid #F0EDE6' }}>
        <button
          type="submit"
          disabled={update.isPending}
          style={{
            height: 34,
            padding: '0 18px',
            background: '#3A7A5A',
            color: 'white',
            border: 'none',
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 500,
            cursor: update.isPending ? 'default' : 'pointer',
            opacity: update.isPending ? 0.7 : 1,
            fontFamily: 'inherit',
          }}
        >
          {update.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

    </form>
  )
}
