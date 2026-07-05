import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconCircleCheckFilled, IconCheck, IconInfoCircle } from '@tabler/icons-react'
import { useCreateEvent } from '@/store/mutations/useEvents'
import { useGetMe } from '@/store/queries/useAuth'
import { CURRENCY_OPTIONS, EVENT_PRESETS } from '@/lib/onboarding'
import { AppSelect } from '@/components/ui/AppSelect'
import { fCurrency } from '@/lib/format'

interface EventDraft {
  id: number
  name: string
  event_type: string
  date: string
  location: string
  vendor_currency: string
  budget: string
  isOpen: boolean
  isSaved: boolean
}

const nextId = (() => { let n = 0; return () => ++n })()

function newDraft(): EventDraft {
  return { id: nextId(), name: '', event_type: '', date: '', location: '', vendor_currency: '', budget: '', isOpen: true, isSaved: false }
}

export function OnboardingStep2() {
  const navigate = useNavigate()
  const { data: user } = useGetMe()
  const baseCurrency = user?.base_currency ?? 'NGN'
  const { mutateAsync: createEvent, isPending } = useCreateEvent()

  const [cards, setCards] = useState<EventDraft[]>([newDraft()])

  const update = (id: number, patch: Partial<EventDraft>) =>
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))

  const saveCard = (id: number) => {
    const card = cards.find(c => c.id === id)
    if (!card || !card.name.trim()) return
    update(id, { isOpen: false, isSaved: true })
  }

  const editCard = (id: number) => update(id, { isOpen: true, isSaved: false })

  const addAnother = () =>
    setCards(prev => [...prev.map(c => ({ ...c, isOpen: false, isSaved: c.name.trim() !== '' })), newDraft()])

  const onFinish = async () => {
    const toSave = cards.filter(c => c.name.trim())
    if (toSave.length === 0) return
    for (const c of toSave) {
      await createEvent({
        name: c.name.trim(),
        event_type: c.event_type || undefined,
        date: c.date || undefined,
        location: c.location || undefined,
        vendor_currency: c.vendor_currency || undefined,
        budget: c.budget ? parseInt(c.budget, 10) : undefined,
      })
    }
    navigate({ to: '/overview' })
  }

  const summaryLabel = (c: EventDraft) =>
    [c.name, c.event_type, c.date].filter(Boolean).join(' · ')

  const summaryBudget = (c: EventDraft) =>
    c.budget ? fCurrency(parseInt(c.budget, 10), baseCurrency) + ' budget' : 'No budget set'

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-[560px] [animation:fadeUp_0.25s_ease]">

        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-[10px] bg-brand inline-flex items-center justify-center mb-3.5">
            <span className="text-white text-[17px] font-semibold tracking-[-0.5px]">M</span>
          </div>
          <div className="flex justify-center gap-[5px] mb-3.5">
            <div style={{ width: 28, height: 3, borderRadius: 2, background: '#3A7A5A' }} />
            <div style={{ width: 28, height: 3, borderRadius: 2, background: '#3A7A5A' }} />
          </div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">Add your events</div>
          <div className="text-[13px] text-text-secondary mt-[5px]">You can always add more from settings.</div>
        </div>

        <div className="flex flex-col gap-2.5">
          {cards.map(c => (
            <div key={c.id}>
              {c.isSaved && (
                <div className="bg-surface border rounded-[10px] px-4 py-3 flex items-center justify-between gap-3"
                  style={{ borderColor: '#C8DDD4' }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconCircleCheckFilled size={18} color="#3A7A5A" className="shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-text-primary truncate">{summaryLabel(c)}</div>
                      <div className="text-[11px] text-text-muted mt-[1px]">{summaryBudget(c)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => editCard(c.id)}
                    className="h-7 px-3 border border-border rounded-[6px] bg-surface text-[11px] text-text-secondary cursor-pointer shrink-0 hover:bg-panel"
                  >
                    Edit
                  </button>
                </div>
              )}

              {c.isOpen && (
                <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3.5">
                  {/* Event name */}
                  <div className="flex flex-col gap-[5px]">
                    <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Event name</label>
                    <input
                      value={c.name}
                      onChange={e => update(c.id, { name: e.target.value })}
                      placeholder="e.g. White wedding"
                      className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
                    />
                  </div>

                  {/* Event type pills */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Event type</label>
                    <div className="flex flex-wrap gap-1.5">
                      {EVENT_PRESETS.map(type => {
                        const active = c.event_type === type
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => update(c.id, { event_type: active ? '' : type })}
                            className="px-3 py-1 rounded-full text-[12px] font-medium cursor-pointer border transition-all"
                            style={{
                              borderColor: active ? '#3A7A5A' : '#E8E6E0',
                              background: active ? '#EEF5F1' : 'white',
                              color: active ? '#2A5C41' : '#595650',
                              borderWidth: active ? 1.5 : 1,
                            }}
                          >
                            {active && <IconCheck size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />}
                            {type}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Date + Location */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-[5px]">
                      <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Date</label>
                      <input
                        type="date"
                        value={c.date}
                        onChange={e => update(c.id, { date: e.target.value })}
                        className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-[5px]">
                      <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Location</label>
                      <input
                        value={c.location}
                        onChange={e => update(c.id, { location: e.target.value })}
                        placeholder="City, Country"
                        className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
                      />
                    </div>
                  </div>

                  {/* Vendor currency + Budget */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-[5px]">
                      <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em] flex items-center gap-1">
                        Vendor currency
                        <IconInfoCircle
                          size={13}
                          color="#9B9890"
                          style={{ cursor: 'help', flexShrink: 0 }}
                          title="The currency vendors at this location will likely charge you in"
                        />
                      </label>
                      <AppSelect
                        value={c.vendor_currency}
                        onChange={v => update(c.id, { vendor_currency: v })}
                        options={[
                          { value: '', label: `Same as base (${baseCurrency})` },
                          ...CURRENCY_OPTIONS.filter(opt => opt.code !== baseCurrency).map(opt => ({ value: opt.code, label: `${opt.code} — ${opt.name}` })),
                        ]}
                      />
                    </div>
                    <div className="flex flex-col gap-[5px]">
                      <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Budget</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={c.budget}
                          onChange={e => update(c.id, { budget: e.target.value })}
                          placeholder="0"
                          className="h-[38px] border border-border rounded-l-[7px] border-r-0 px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full min-w-0"
                        />
                        <div className="h-[38px] border border-border rounded-r-[7px] px-3 text-[12px] font-semibold bg-[#F2F1EC] text-text-muted flex items-center shrink-0">
                          {baseCurrency}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => saveCard(c.id)}
                      className="h-8 px-3.5 bg-brand text-white border-none rounded-[7px] text-[12px] font-medium cursor-pointer flex items-center gap-[5px] hover:bg-brand-dark"
                    >
                      <IconCheck size={13} /> Save event
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addAnother}
            className="h-10 rounded-[10px] text-[13px] font-medium text-text-secondary cursor-pointer hover:text-brand"
            style={{ border: '1.5px dashed #D0CEC8', background: 'transparent' }}
          >
            + Add another event
          </button>

          <button
            type="button"
            onClick={onFinish}
            disabled={isPending || cards.every(c => !c.name.trim())}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Setting up…' : 'Go to overview →'}
          </button>
        </div>
      </div>
    </div>
  )
}
