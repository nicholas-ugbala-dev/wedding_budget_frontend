import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconSearch, IconCheck } from '@tabler/icons-react'
import { useOnboard1 } from '@/store/mutations/useAuth'
import { CURRENCY_OPTIONS } from '@/lib/onboarding'
import { useGetMe } from '@/store/queries/useAuth'

export function OnboardingStep1() {
  const navigate = useNavigate()
  const { data: user } = useGetMe()
  const { mutate: onboard, isPending } = useOnboard1()

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState('')

  const filtered = useMemo(() =>
    CURRENCY_OPTIONS.filter(c =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  )

  const onContinue = () => {
    if (!selected) return
    const isPlanner = user?.account_type === 'planner'
    onboard(
      { base_currency: selected },
      {
        onSuccess: () =>
          navigate({ to: isPlanner ? '/onboarding/planner-step-1' : '/onboarding/step-2' }),
      },
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-[440px] [animation:fadeUp_0.25s_ease]">

        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-[10px] bg-brand inline-flex items-center justify-center mb-3.5">
            <span className="text-white text-[17px] font-semibold tracking-[-0.5px]">M</span>
          </div>
          {/* Step dots */}
          <div className="flex justify-center gap-[5px] mb-3.5">
            <div style={{ width: 28, height: 3, borderRadius: 2, background: '#3A7A5A' }} />
            <div style={{ width: 28, height: 3, borderRadius: 2, background: '#E8E6E0' }} />
          </div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">
            What currency do you earn and hold in?
          </div>
          <div className="text-[13px] text-text-secondary mt-[5px] leading-relaxed">
            This will be your base currency for budgeting across all your events.
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search currencies…"
              className="w-full h-[42px] border border-border rounded-lg pl-9 pr-3 text-[14px] bg-panel text-text-primary outline-none focus:border-brand"
            />
          </div>

          {/* Currency list */}
          <div className="flex flex-col gap-1.5 max-h-[264px] overflow-y-auto">
            {filtered.map(cur => {
              const active = selected === cur.code
              return (
                <div
                  key={cur.code}
                  onClick={() => setSelected(cur.code)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-all shrink-0"
                  style={{
                    border: `1.5px solid ${active ? '#3A7A5A' : '#E8E6E0'}`,
                    background: active ? '#EEF5F1' : 'white',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1B18', minWidth: 38 }}>
                      {cur.code}
                    </span>
                    <span style={{ fontSize: 13, color: '#595650' }}>{cur.name}</span>
                  </div>
                  {active && <IconCheck size={16} color="#3A7A5A" />}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="py-6 text-center text-[13px] text-text-muted">No currencies match</div>
            )}
          </div>

          <button
            type="button"
            onClick={onContinue}
            disabled={!selected || isPending}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving…' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
