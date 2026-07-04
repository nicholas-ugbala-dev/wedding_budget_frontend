import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconPlus, IconPencil, IconTrash, IconUsers, IconChevronRight, IconX, IconLock, IconSearch } from '@tabler/icons-react'
import { Pagination } from '@/components/ui/Pagination'
import { useGetClients } from '@/store/queries/useClients'
import { useCreateClient, useUpdateClient, useDeleteClient } from '@/store/mutations/useClients'
import { useClientStore } from '@/store/useClientStore'
import { CenteredModal } from '@/components/layout/CenteredModal'
import { CURRENCY_OPTIONS } from '@/lib/onboarding'
import { fCurrency, fDate } from '@/lib/format'
import { toast } from 'sonner'
import type { Client } from '@/types/client'

const GRID = '32px 2fr 1.5fr 1fr 1.2fr 64px'

function initials(c: Client) {
  return [c.first_name[0], c.last_name?.[0]].filter(Boolean).join('').toUpperCase()
}

export function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [limit, setLimit]     = useState(10)

  const { data, isLoading } = useGetClients({ search, page, limit })
  const clients    = data?.items ?? []
  const pagination = data?.pagination

  const { mutate: createClient, isPending: creating } = useCreateClient()
  const { mutate: updateClient, isPending: updating } = useUpdateClient()
  const { mutate: deleteClient } = useDeleteClient()
  const { setActiveClient } = useClientStore()

  const handleSearch = useCallback((val: string) => {
    setSearch(val)
    setPage(1)
  }, [])

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [extraCurrencies, setExtraCurrencies] = useState<string[]>([])

  const allSelected = (clients as Client[]).length > 0 && selected.size === (clients as Client[]).length
  const hasSelection = selected.size > 0
  const singleSelected = selected.size === 1
  const isEdit = editingId !== null

  const toggleSelectAll = () =>
    allSelected
      ? setSelected(new Set())
      : setSelected(new Set((clients as Client[]).map(c => c.id)))

  const toggleSelect = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const openAdd = () => {
    setEditingId(null)
    setFirstName('')
    setLastName('')
    setCurrency('NGN')
    setExtraCurrencies([])
    setModalOpen(true)
  }

  const openEdit = () => {
    const id = [...selected][0]
    const cl = (clients as Client[]).find(c => c.id === id)
    if (!cl) return
    setEditingId(id)
    setFirstName(cl.first_name)
    setLastName(cl.last_name ?? '')
    setCurrency(cl.currency_code)
    setExtraCurrencies([])
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const onSave = () => {
    if (!firstName.trim()) {
      toast.error('First name is required')
      return
    }
    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim() || undefined,
      ...(isEdit ? {} : { currency_code: currency }),
      extra_currencies: extraCurrencies.length ? extraCurrencies : undefined,
    }
    if (!isEdit) {
      createClient(payload, { onSuccess: closeModal })
    } else {
      updateClient(
        { id: editingId!, ...payload },
        { onSuccess: () => { closeModal(); setSelected(new Set()) } },
      )
    }
  }

  const onDelete = () => {
    ;[...selected].forEach(id => deleteClient(id))
    setSelected(new Set())
  }

  const handleRowClick = (cl: Client) => {
    setActiveClient(cl)
    navigate({ to: '/overview' })
  }

  return (
    <div className="px-8 py-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.3px' }}>Clients</div>
          <div style={{ fontSize: 13, color: '#595650', marginTop: 2 }}>Every client account you manage</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <IconSearch size={13} color="#9B9890" style={{ position: 'absolute', left: 10, pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search clients…"
              style={{ height: 34, paddingLeft: 30, paddingRight: 12, border: '1px solid #E8E6E0', borderRadius: 7, fontSize: 12, background: '#FAFAF8', color: '#1C1B18', outline: 'none', width: 200, fontFamily: 'inherit' }}
            />
          </div>
          {hasSelection && (
            <span style={{ fontSize: 12, color: '#595650', marginRight: 2 }}>
              {selected.size} selected
            </span>
          )}
          {singleSelected && (
            <button
              type="button"
              onClick={openEdit}
              className="h-[34px] px-3.5 border border-border rounded-[7px] bg-surface text-[12px] text-text-primary font-medium cursor-pointer flex items-center gap-[5px] hover:bg-panel"
            >
              <IconPencil size={13} /> Edit
            </button>
          )}
          {hasSelection && (
            <button
              type="button"
              onClick={onDelete}
              className="h-[34px] px-3.5 border rounded-[7px] text-[12px] font-medium cursor-pointer flex items-center gap-[5px]"
              style={{ borderColor: '#F0C8C8', background: '#FDF8F8', color: '#C43C3C' }}
            >
              <IconTrash size={13} /> Delete
            </button>
          )}
          <button
            type="button"
            onClick={openAdd}
            className="h-[34px] px-3.5 bg-brand text-white border-none rounded-[7px] text-[12px] font-medium cursor-pointer flex items-center gap-[5px] hover:bg-brand-dark"
          >
            <IconPlus size={13} /> Add client
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        {/* Header row */}
        <div
          className="grid text-[10px] font-semibold text-text-muted uppercase tracking-[0.07em] items-center"
          style={{ gridTemplateColumns: GRID, padding: '10px 16px', background: '#FAFAF8', borderBottom: '1px solid #E8E6E0' }}
        >
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            style={{ width: 15, height: 15, accentColor: '#3A7A5A', cursor: 'pointer', margin: 0 }}
          />
          <div>Client</div>
          <div>Next event</div>
          <div>Date</div>
          <div>Total budget</div>
          <div />
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-[13px] text-text-muted">Loading…</div>
        ) : (clients as Client[]).length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-2.5">
            <IconUsers size={32} color="#C0BEB8" />
            <div style={{ fontSize: 13, color: '#9B9890' }}>No clients yet</div>
            <div style={{ fontSize: 12, color: '#C0BEB8' }}>Add your first client to start tracking their events.</div>
          </div>
        ) : (
          (clients as Client[]).map(cl => (
            <div
              key={cl.id}
              className="grid items-center cursor-pointer transition-colors hover:bg-[#FAFAF8]"
              style={{ gridTemplateColumns: GRID, padding: '12px 16px', borderBottom: '1px solid #F0EDE6' }}
              onClick={() => handleRowClick(cl)}
            >
              {/* Checkbox */}
              <div onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.has(cl.id)}
                  onChange={() => toggleSelect(cl.id)}
                  style={{ width: 15, height: 15, accentColor: '#3A7A5A', cursor: 'pointer', margin: 0 }}
                />
              </div>

              {/* Client avatar + name + currency */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#EEF5F1', border: '1px solid #C8DDD4', fontSize: 11, fontWeight: 600, color: '#2A5C41' }}
                >
                  {initials(cl)}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-text-primary truncate">
                    {cl.first_name}{cl.last_name ? ` ${cl.last_name}` : ''}
                  </div>
                  <div className="text-[11px] text-text-muted mt-[1px]">{cl.currency_code}</div>
                </div>
              </div>

              {/* Next event name */}
              <div className="text-[12px] text-text-secondary truncate">
                {cl.next_event_name ?? <span className="text-text-muted">—</span>}
              </div>

              {/* Next event date */}
              <div className="text-[12px] text-text-secondary tabular-nums">
                {cl.next_event_date ? fDate(cl.next_event_date) : <span className="text-text-muted">—</span>}
              </div>

              {/* Total budget */}
              <div className="text-[12px] font-medium text-text-primary tabular-nums">
                {cl.total_budget ? fCurrency(cl.total_budget, cl.currency_code) : <span className="text-text-muted">—</span>}
              </div>

              {/* Chevron */}
              <div className="flex items-center justify-end">
                <IconChevronRight size={14} color="#C0BEB8" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-3">
          <Pagination
            pagination={pagination}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={l => { setLimit(l); setPage(1) }}
          />
        </div>
      )}

      {/* Add / Edit modal */}
      <CenteredModal open={modalOpen} onClose={closeModal}>
        <div style={{ width: 460, background: 'white', borderRadius: 14, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(28,27,24,0.22)', overflow: 'hidden' }}>
          {/* Modal header */}
          <div style={{ padding: '22px 28px', borderBottom: '1px solid #F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.2px' }}>
              {isEdit ? 'Edit client' : 'Add client'}
            </div>
            <button
              type="button"
              onClick={closeModal}
              style={{ width: 30, height: 30, border: '1px solid #E8E6E0', borderRadius: 7, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconX size={15} color="#595650" />
            </button>
          </div>

          {/* Modal body */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#595650', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  First name <span style={{ color: '#C43C3C' }}>*</span>
                </label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Amara"
                  style={{ height: 40, border: '1px solid #E8E6E0', borderRadius: 8, padding: '0 12px', fontSize: 13, background: '#FAFAF8', color: '#1C1B18', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#595650', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Okafor"
                  style={{ height: 40, border: '1px solid #E8E6E0', borderRadius: 8, padding: '0 12px', fontSize: 13, background: '#FAFAF8', color: '#1C1B18', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#595650', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base currency</label>
              {isEdit ? (
                <>
                  <div style={{ fontSize: 11, color: '#9B9890', marginTop: -2 }}>Base currency is locked once set and cannot be changed.</div>
                  <div style={{ height: 40, border: '1px solid #E8E6E0', borderRadius: 8, padding: '0 12px', fontSize: 13, background: '#F4F3EF', color: '#9B9890', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{currency}</span>
                    <IconLock size={13} color="#C0BEB8" />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: '#9B9890', marginTop: -2 }}>What currency does your client hold?</div>
                  <select
                    value={currency}
                    onChange={e => {
                      const next = e.target.value
                      setCurrency(next)
                      setExtraCurrencies(prev => prev.filter(c => c !== next))
                    }}
                    style={{ height: 40, border: '1px solid #E8E6E0', borderRadius: 8, padding: '0 12px', fontSize: 13, background: '#FAFAF8', color: '#1C1B18', width: '100%', outline: 'none' }}
                  >
                    {CURRENCY_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>{opt.code} — {opt.name}</option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {/* Other operating currencies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#595650', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Other currencies
              </label>
              <div style={{ fontSize: 11, color: '#9B9890', marginTop: -2 }}>Currencies the client also pays in (e.g. vendor currencies)</div>
              {extraCurrencies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                  {extraCurrencies.map(code => (
                    <span
                      key={code}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: '#EEF5F1', color: '#2A5C41',
                        border: '1px solid #C8DDD4', borderRadius: 100,
                        padding: '3px 10px', fontSize: 12, fontWeight: 500,
                      }}
                    >
                      {code}
                      <button
                        type="button"
                        onClick={() => setExtraCurrencies(prev => prev.filter(c => c !== code))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#3A7A5A', fontSize: 14 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <select
                value=""
                onChange={e => {
                  const code = e.target.value
                  if (code && code !== currency && !extraCurrencies.includes(code)) {
                    setExtraCurrencies(prev => [...prev, code])
                  }
                }}
                style={{ height: 36, border: '1px solid #E8E6E0', borderRadius: 8, padding: '0 12px', fontSize: 13, background: '#FAFAF8', color: '#9B9890', width: '100%', outline: 'none' }}
              >
                <option value="">+ Add currency…</option>
                {CURRENCY_OPTIONS.filter(opt => opt.code !== currency && !extraCurrencies.includes(opt.code)).map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.code} — {opt.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal footer */}
          <div style={{ padding: '16px 28px', borderTop: '1px solid #F0EDE6', display: 'flex', gap: 8, justifyContent: 'flex-end', background: '#FAFAF8' }}>
            <button
              type="button"
              onClick={closeModal}
              style={{ height: 38, padding: '0 18px', border: '1px solid #E8E6E0', borderRadius: 8, background: 'white', fontSize: 13, color: '#595650', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={creating || updating}
              style={{ height: 38, padding: '0 22px', background: '#1C1B18', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', opacity: creating || updating ? 0.5 : 1 }}
            >
              {isEdit ? (updating ? 'Saving…' : 'Save changes') : (creating ? 'Adding…' : 'Add client')}
            </button>
          </div>
        </div>
      </CenteredModal>
    </div>
  )
}
