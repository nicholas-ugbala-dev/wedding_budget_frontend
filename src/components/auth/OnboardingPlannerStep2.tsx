import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconCheck } from '@tabler/icons-react'
import { useCreateEvent } from '@/store/mutations/useEvents'
import { useGetClients } from '@/store/queries/useClients'
import { EVENT_PRESETS, CURRENCY_OPTIONS } from '@/lib/onboarding'
import type { Client } from '@/types/client'

export function OnboardingPlannerStep2() {
  const navigate = useNavigate()
  const { data: clients = [] } = useGetClients()
  const { mutateAsync: createEvent, isPending } = useCreateEvent()

  const [selectedClientId, setSelectedClientId] = useState('')
  const [name, setName] = useState('')
  const [eventType, setEventType] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [vendorCurrency, setVendorCurrency] = useState('')
  const [budget, setBudget] = useState('')

  const selectedClient = (clients as Client[]).find(c => c.id === selectedClientId)

  const onFinish = async () => {
    if (!name.trim()) return
    await createEvent({
      name: name.trim(),
      event_type: eventType || undefined,
      date: date || undefined,
      location: location || undefined,
      vendor_currency: vendorCurrency || undefined,
      budget: budget ? parseInt(budget, 10) : undefined,
      client_id: selectedClientId || undefined,
    })
    navigate({ to: '/clients' })
  }

  const clientCurrency = selectedClient?.currency_code ?? 'NGN'

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
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">Add events for your clients</div>
          <div className="text-[13px] text-text-secondary mt-[5px]">Choose a client, then add their event.</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
          {/* Client selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Client</label>
            <div className="flex flex-wrap gap-[7px]">
              {(clients as Client[]).map(c => {
                const active = c.id === selectedClientId
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClientId(c.id)}
                    className="px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer border transition-all"
                    style={{
                      borderColor: active ? '#3A7A5A' : '#E8E6E0',
                      background: active ? '#EEF5F1' : 'white',
                      color: active ? '#2A5C41' : '#595650',
                      borderWidth: active ? 1.5 : 1,
                    }}
                  >
                    {c.first_name} {c.last_name}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F0EDE6' }} />

          {/* Event name */}
          <div className="flex flex-col gap-[5px]">
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Event name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. White wedding"
              className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
            />
          </div>

          {/* Event type pills */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Event type</label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_PRESETS.map(type => {
                const active = eventType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(active ? '' : type)}
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
                value={date}
                onChange={e => setDate(e.target.value)}
                className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Location</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, Country"
                className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
              />
            </div>
          </div>

          {/* Vendor currency + Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Vendor currency</label>
              <select
                value={vendorCurrency}
                onChange={e => setVendorCurrency(e.target.value)}
                className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
              >
                <option value="">Same as base ({clientCurrency})</option>
                {CURRENCY_OPTIONS.filter(opt => opt.code !== clientCurrency).map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.code} — {opt.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Budget</label>
              <div className="flex">
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="0"
                  className="h-[38px] border border-border rounded-l-[7px] border-r-0 px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full min-w-0"
                />
                <div className="h-[38px] border border-border rounded-r-[7px] px-3 text-[12px] font-semibold bg-[#F2F1EC] text-text-muted flex items-center shrink-0">
                  {clientCurrency}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onFinish}
            disabled={isPending || !name.trim()}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Setting up…' : 'Go to clients →'}
          </button>
        </div>
      </div>
    </div>
  )
}
