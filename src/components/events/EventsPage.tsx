import { useState } from 'react'
import { IconCircleCheckFilled, IconCheck, IconTrash } from '@tabler/icons-react'
import { useGetEvents } from '@/store/queries/useEvents'
import { useGetMe } from '@/store/queries/useAuth'
import { useBaseCurrency } from '@/store/queries/useBaseCurrency'
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/store/mutations/useEvents'
import { useClientStore } from '@/store/useClientStore'
import { CURRENCY_OPTIONS, EVENT_PRESETS } from '@/lib/onboarding'
import { fCurrency } from '@/lib/format'
import type { Event } from '@/types/event'

interface EventCard extends Event {
  isOpen: boolean
  isDirty: boolean
  // draft fields for open state
  draftName: string
  draftType: string
  draftDate: string
  draftLocation: string
  draftVendorCurrency: string
  draftBudget: string
}

function toCard(ev: Event): EventCard {
  return {
    ...ev,
    isOpen: false,
    isDirty: false,
    draftName: ev.name,
    draftType: ev.event_type ?? '',
    draftDate: ev.date ?? '',
    draftLocation: ev.location ?? '',
    draftVendorCurrency: ev.vendor_currency ?? '',
    draftBudget: ev.budget != null ? String(ev.budget) : '',
  }
}

// New event draft (no id yet)
let _newId = -1
function newCard(): EventCard {
  return {
    id: String(--_newId),
    user_id: '',
    name: '',
    event_type: null,
    date: null,
    location: null,
    vendor_currency: null,
    budget: null,
    client_id: null,
    created_at: '',
    isOpen: true,
    isDirty: false,
    draftName: '',
    draftType: '',
    draftDate: '',
    draftLocation: '',
    draftVendorCurrency: '',
    draftBudget: '',
  }
}

export function EventsPage() {
  const { data: user } = useGetMe()
  const { data: events = [], isLoading } = useGetEvents()
  const { mutate: createEvent, isPending: creating } = useCreateEvent()
  const { mutate: updateEvent, isPending: updating } = useUpdateEvent()
  const { mutate: deleteEvent } = useDeleteEvent()

  const baseCurrency = useBaseCurrency()
  const isPlanner = user?.account_type === 'planner'
  const { activeClient } = useClientStore()

  // local card state — synced from server, extended with UI state
  const [cards, setCards] = useState<EventCard[]>([])
  const [serverSynced, setServerSynced] = useState(false)

  // Sync server data once on load
  if (!serverSynced && (events as Event[]).length >= 0 && !isLoading) {
    setCards((events as Event[]).map(toCard))
    setServerSynced(true)
  }

  const patch = (id: string, p: Partial<EventCard>) =>
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...p } : c))

  const openCard = (id: string) =>
    setCards(prev => prev.map(c => c.id === id ? { ...c, isOpen: true } : c))

  const saveCard = (card: EventCard) => {
    if (!card.draftName.trim()) return
    const payload = {
      name: card.draftName.trim(),
      event_type: card.draftType || undefined,
      date: card.draftDate || undefined,
      location: card.draftLocation || undefined,
      vendor_currency: card.draftVendorCurrency || undefined,
      budget: card.draftBudget ? parseInt(card.draftBudget, 10) : undefined,
      ...(isPlanner && activeClient ? { client_id: activeClient.id } : {}),
    }
    if (Number(card.id) < 0) {
      // new event
      createEvent(payload, {
        onSuccess: (created) => {
          setCards(prev => prev.map(c => c.id === card.id ? toCard(created as Event) : c))
        },
      })
    } else {
      updateEvent({ id: card.id, ...payload }, {
        onSuccess: (updated) => {
          setCards(prev => prev.map(c => c.id === card.id ? { ...toCard(updated as Event), isOpen: false } : c))
        },
      })
    }
  }

  const removeCard = (card: EventCard) => {
    if (Number(card.id) < 0) {
      setCards(prev => prev.filter(c => c.id !== card.id))
    } else {
      deleteEvent(card.id, {
        onSuccess: () => setCards(prev => prev.filter(c => c.id !== card.id)),
      })
    }
  }

  const addNew = () =>
    setCards(prev => [...prev.map(c => ({ ...c, isOpen: false })), newCard()])

  const subtitle = isPlanner && activeClient
    ? `Managing events for ${activeClient.first_name}${activeClient.last_name ? ` ${activeClient.last_name}` : ''}`
    : isPlanner
      ? 'Select a client to manage their events'
      : 'Your events and their budgets'

  const isPending = creating || updating

  return (
    <div className="px-8 py-7">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.3px' }}>Events</div>
            <div style={{ fontSize: 13, color: '#595650', marginTop: 2 }}>{subtitle}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {isLoading ? (
            <div className="py-16 text-center text-[13px] text-text-muted">Loading…</div>
          ) : (
            cards.map(c => (
              <div key={c.id}>
                {/* Saved / collapsed */}
                {!c.isOpen && (() => {
                  const isNew = Number(c.id) < 0
                  const displayName = isNew ? c.draftName : c.name
                  const displayType = isNew ? c.draftType : c.event_type
                  const displayBudget = isNew
                    ? (c.draftBudget ? fCurrency(parseInt(c.draftBudget, 10), baseCurrency) + ' budget' : 'No budget set')
                    : (c.budget != null ? fCurrency(c.budget, baseCurrency) + ' budget' : 'No budget set')
                  return (
                    <div
                      className="bg-surface rounded-[10px] px-4 py-3 flex items-center justify-between gap-3"
                      style={{ border: `1px solid ${isNew ? '#D0CEC8' : '#C8DDD4'}` }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconCircleCheckFilled size={18} color={isNew ? '#C0BEB8' : '#3A7A5A'} className="shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium truncate" style={{ color: isNew && !displayName ? '#9B9890' : '#1C1B18' }}>
                            {[displayName || (isNew ? 'New event' : ''), displayType].filter(Boolean).join(' · ')}
                          </div>
                          <div className="text-[11px] text-text-muted mt-[1px]">{displayBudget}</div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {isNew ? (
                          <button
                            type="button"
                            onClick={() => openCard(c.id)}
                            className="h-7 px-3 border rounded-[6px] text-[11px] font-medium cursor-pointer"
                            style={{ borderColor: '#B8D9C8', background: '#EEF5F1', color: '#2A5C41' }}
                          >
                            Save
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openCard(c.id)}
                              className="h-7 px-3 border border-border rounded-[6px] bg-surface text-[11px] text-text-secondary cursor-pointer hover:bg-panel"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCard(c)}
                              className="h-7 w-7 border border-border rounded-[6px] bg-surface text-text-muted cursor-pointer hover:bg-[#FDF0F0] hover:text-[#A83030] flex items-center justify-center"
                            >
                              <IconTrash size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Open / expanded */}
                {c.isOpen && (
                  <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3.5">
                    <div className="flex flex-col gap-[5px]">
                      <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Event name</label>
                      <input
                        value={c.draftName}
                        onChange={e => patch(c.id, { draftName: e.target.value })}
                        placeholder="e.g. White wedding"
                        className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Event type</label>
                      <div className="flex flex-wrap gap-1.5">
                        {EVENT_PRESETS.map(type => {
                          const active = c.draftType === type
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => patch(c.id, { draftType: active ? '' : type })}
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

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-[5px]">
                        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Date</label>
                        <input
                          type="date"
                          value={c.draftDate}
                          onChange={e => patch(c.id, { draftDate: e.target.value })}
                          className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-[5px]">
                        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Location</label>
                        <input
                          value={c.draftLocation}
                          onChange={e => patch(c.id, { draftLocation: e.target.value })}
                          placeholder="City, Country"
                          className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-[5px]">
                        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Vendor currency</label>
                        <select
                          value={c.draftVendorCurrency}
                          onChange={e => patch(c.id, { draftVendorCurrency: e.target.value })}
                          className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
                        >
                          <option value="">Same as base ({baseCurrency})</option>
                          {CURRENCY_OPTIONS.filter(opt => opt.code !== baseCurrency).map(opt => (
                            <option key={opt.code} value={opt.code}>{opt.code} — {opt.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-[5px]">
                        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Budget</label>
                        <div className="flex">
                          <input
                            type="number"
                            value={c.draftBudget}
                            onChange={e => patch(c.id, { draftBudget: e.target.value })}
                            placeholder="0"
                            className="h-[38px] border border-border rounded-l-[7px] border-r-0 px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full min-w-0"
                          />
                          <div className="h-[38px] border border-border rounded-r-[7px] px-3 text-[12px] font-semibold bg-[#F2F1EC] text-text-muted flex items-center shrink-0">
                            {baseCurrency}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => removeCard(c)}
                        className="text-[12px] text-text-muted cursor-pointer hover:text-[#A83030] flex items-center gap-1.5"
                        style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
                      >
                        <IconTrash size={13} /> {Number(c.id) < 0 ? 'Discard' : 'Delete event'}
                      </button>
                      <button
                        type="button"
                        onClick={() => saveCard(c)}
                        disabled={isPending || !c.draftName.trim()}
                        className="h-8 px-3.5 bg-brand text-white border-none rounded-[7px] text-[12px] font-medium cursor-pointer flex items-center gap-[5px] hover:bg-brand-dark disabled:opacity-50"
                      >
                        <IconCheck size={13} /> Save event
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <button
            type="button"
            onClick={addNew}
            className="h-10 rounded-[10px] text-[13px] font-medium text-text-secondary cursor-pointer hover:text-brand hover:border-brand transition-colors"
            style={{ border: '1.5px dashed #D0CEC8', background: 'transparent' }}
          >
            + Add another event
          </button>
        </div>
      </div>
    </div>
  )
}
