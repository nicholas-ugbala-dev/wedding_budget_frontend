import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { IconLock } from '@tabler/icons-react'
import { useGetMe } from '@/store/queries/useAuth'
import { useUpdateAccount } from '@/store/mutations/useSettings'
import { CURRENCY_META } from '@/lib/format'

type ProfileForm = {
  first_name: string
  last_name: string
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

const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  background: '#F4F3EF',
  color: '#9B9890',
  cursor: 'default',
}

export function AccountTab() {
  const { data: user } = useGetMe()
  const update         = useUpdateAccount()
  const { register, handleSubmit, reset } = useForm<ProfileForm>()

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name ?? '',
        last_name:  user.last_name  ?? '',
      })
    }
  }, [user, reset])

  const baseCurrency = user?.base_currency ?? ''
  const baseMeta     = CURRENCY_META[baseCurrency]
  const isplanner     = user?.account_type === 'planner'

  return (
    <form onSubmit={handleSubmit(data => update.mutate(data))} className="flex flex-col gap-5">

      <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18', marginBottom: 2 }}>Profile</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>First name</label>
          <input {...register('first_name')} placeholder="First name" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Last name</label>
          <input {...register('last_name')} placeholder="Last name" style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Email</label>
        <input readOnly value={user?.email ?? ''} style={readOnlyStyle} />
      </div>

      {!isplanner && (<div>
        <label style={labelStyle}>Base currency</label>
        <div style={{ position: 'relative' }}>
          <input
            readOnly
            value={baseCurrency && baseMeta ? `${baseCurrency} — ${baseMeta.name}` : baseCurrency}
            style={readOnlyStyle}
          />
          <IconLock size={13} color="#C0BEB8" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <div style={{ fontSize: 11, color: '#C0BEB8', marginTop: 4 }}>Base currency is locked and cannot be changed.</div>
      </div>)}

      <div style={{ paddingTop: 8, borderTop: '1px solid #F0EDE6', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={update.isPending}
          style={{
            height: 34, padding: '0 18px',
            background: '#3A7A5A', color: 'white',
            border: 'none', borderRadius: 7,
            fontSize: 13, fontWeight: 500,
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
