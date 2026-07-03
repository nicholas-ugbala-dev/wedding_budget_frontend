import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconX } from '@tabler/icons-react'
import { useCreateClient } from '@/store/mutations/useClients'
import { CURRENCY_OPTIONS } from '@/lib/onboarding'
import { toast } from 'sonner'

interface ClientPill {
  id: string
  first_name: string
  last_name: string
  currency_code: string
}

export function OnboardingPlannerStep1() {
  const navigate = useNavigate()
  const { mutateAsync: createClient } = useCreateClient()

  const [pills, setPills] = useState<ClientPill[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [isPending, setIsPending] = useState(false)

  const addClient = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required')
      return
    }
    setPills(prev => [...prev, {
      id: crypto.randomUUID(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      currency_code: currency,
    }])
    setFirstName('')
    setLastName('')
    setCurrency('NGN')
  }

  const remove = (id: string) => setPills(prev => prev.filter(p => p.id !== id))

  const onContinue = async () => {
    if (pills.length === 0) {
      toast.error('Add at least one client')
      return
    }
    setIsPending(true)
    try {
      for (const p of pills) {
        await createClient({ first_name: p.first_name, last_name: p.last_name, currency_code: p.currency_code })
      }
      navigate({ to: '/onboarding/planner-step-2' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-[480px] [animation:fadeUp_0.25s_ease]">

        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-[10px] bg-brand inline-flex items-center justify-center mb-3.5">
            <span className="text-white text-[17px] font-semibold tracking-[-0.5px]">M</span>
          </div>
          <div className="flex justify-center gap-[5px] mb-3.5">
            <div style={{ width: 28, height: 3, borderRadius: 2, background: '#3A7A5A' }} />
            <div style={{ width: 28, height: 3, borderRadius: 2, background: '#E8E6E0' }} />
          </div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">Add your clients</div>
          <div className="text-[13px] text-text-secondary mt-[5px]">You can add more from your dashboard anytime.</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
          {/* Client pills */}
          {pills.length > 0 && (
            <div className="flex flex-wrap gap-[7px]">
              {pills.map(p => (
                <div
                  key={p.id}
                  className="inline-flex items-center gap-[7px] px-3.5 py-1.5 rounded-full"
                  style={{ background: '#EEF5F1', border: '1px solid #C8DDD4' }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#2A5C41' }}>
                    {p.first_name} {p.last_name}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#9B9890' }}>{p.currency_code}</span>
                  <IconX size={12} color="#9B9890" className="cursor-pointer" onClick={() => remove(p.id)} />
                </div>
              ))}
            </div>
          )}

          {/* Client form */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">
                First name <span className="text-[#C43C3C]">*</span>
              </label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addClient()}
                placeholder="Amara"
                className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">
                Last name <span className="text-[#C43C3C]">*</span>
              </label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addClient()}
                placeholder="Obi"
                className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[5px]">
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">
              Client's base currency
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
            >
              {CURRENCY_OPTIONS.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.code} — {opt.name}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={addClient}
            className="h-9 border border-dashed rounded-[7px] text-[13px] font-medium cursor-pointer hover:text-brand"
            style={{ borderColor: '#C0BEB8', color: '#595650', background: 'transparent' }}
          >
            + Add client
          </button>

          <div style={{ borderTop: '1px solid #F0EDE6' }} />

          <button
            type="button"
            onClick={onContinue}
            disabled={isPending || pills.length === 0}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving…' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
