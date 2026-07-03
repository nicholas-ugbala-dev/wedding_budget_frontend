import { useState } from 'react'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useGetClients } from '@/store/queries/useClients'
import { useCreateClient, useDeleteClient } from '@/store/mutations/useClients'
import { CURRENCY_OPTIONS } from '@/lib/onboarding'
import { toast } from 'sonner'
import type { Client } from '@/types/client'

function initials(c: Client) {
  return `${c.first_name[0]}${c.last_name[0]}`.toUpperCase()
}

export function ClientsPage() {
  const { data: clients = [], isLoading } = useGetClients()
  const { mutate: createClient, isPending: creating } = useCreateClient()
  const { mutate: deleteClient } = useDeleteClient()

  const [showForm, setShowForm] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currency, setCurrency] = useState('NGN')

  const onAdd = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required')
      return
    }
    createClient(
      { first_name: firstName.trim(), last_name: lastName.trim(), currency_code: currency },
      {
        onSuccess: () => {
          setFirstName('')
          setLastName('')
          setCurrency('NGN')
          setShowForm(false)
        },
      },
    )
  }

  return (
    <div className="px-8 py-7">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.3px' }}>Clients</div>
          <div style={{ fontSize: 13, color: '#595650', marginTop: 2 }}>Every client account you manage</div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="h-[34px] px-3.5 bg-brand text-white border-none rounded-[7px] text-[12px] font-medium cursor-pointer flex items-center gap-[5px] hover:bg-brand-dark"
        >
          <IconPlus size={13} /> Add client
        </button>
      </div>

      {/* Add client form */}
      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">
                First name <span className="text-[#C43C3C]">*</span>
              </label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
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
                placeholder="Obi"
                className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary outline-none focus:border-brand w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">Base currency</label>
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
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-8 px-3.5 border border-border rounded-[7px] text-[12px] text-text-secondary cursor-pointer bg-surface hover:bg-panel"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAdd}
              disabled={creating}
              className="h-8 px-3.5 bg-brand text-white border-none rounded-[7px] text-[12px] font-medium cursor-pointer hover:bg-brand-dark disabled:opacity-50"
            >
              {creating ? 'Adding…' : 'Add client'}
            </button>
          </div>
        </div>
      )}

      {/* Client table */}
      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        {/* Table header */}
        <div
          className="grid text-[10px] font-semibold text-text-muted uppercase tracking-[0.07em]"
          style={{ gridTemplateColumns: '2fr 1fr 80px', padding: '10px 16px', background: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}
        >
          <div>Client</div>
          <div>Currency</div>
          <div />
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-[13px] text-text-muted">Loading…</div>
        ) : (clients as Client[]).length === 0 ? (
          <div className="py-16 text-center text-[13px] text-text-muted">No clients yet. Add your first client above.</div>
        ) : (
          (clients as Client[]).map(cl => (
            <div
              key={cl.id}
              className="grid items-center"
              style={{ gridTemplateColumns: '2fr 1fr 80px', padding: '12px 16px', borderBottom: '1px solid #F0EDE6' }}
            >
              {/* Client name + avatar */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#EEF5F1', border: '1px solid #C8DDD4', fontSize: 11, fontWeight: 600, color: '#2A5C41' }}
                >
                  {initials(cl)}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-text-primary truncate">
                    {cl.first_name} {cl.last_name}
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div>
                <span
                  className="inline-flex px-2 py-[3px] rounded-full text-[11px] font-semibold"
                  style={{ background: '#F0EEE9', color: '#595650', border: '1px solid #DDD9D3' }}
                >
                  {cl.currency_code}
                </span>
              </div>

              {/* Delete */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => deleteClient(cl.id)}
                  className="w-7 h-7 rounded-[6px] border border-border bg-surface text-text-muted cursor-pointer flex items-center justify-center hover:bg-[#FDF0F0] hover:text-[#A83030]"
                >
                  <IconX size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
