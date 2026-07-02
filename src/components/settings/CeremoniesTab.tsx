import { useState } from 'react'
import { IconPencil, IconTrash, IconCheck, IconX, IconPlus } from '@tabler/icons-react'
import { useGetCeremonies } from '@/store/queries/useCeremonies'
import { useCreateCeremony, useUpdateCeremony, useDeleteCeremony } from '@/store/mutations/useCeremonies'
import type { Ceremony } from '@/types/ceremony'

const rowInputStyle: React.CSSProperties = {
  flex: 1,
  height: 30,
  border: '1px solid #E8E6E0',
  borderRadius: 5,
  padding: '0 8px',
  fontSize: 13,
  color: '#1C1B18',
  outline: 'none',
  fontFamily: 'inherit',
}

export function CeremoniesTab() {
  const { data: ceremonies = [] } = useGetCeremonies()
  const createCeremony = useCreateCeremony()
  const updateCeremony = useUpdateCeremony()
  const deleteCeremony = useDeleteCeremony()

  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editValue, setEditValue]   = useState('')
  const [showAdd, setShowAdd]       = useState(false)
  const [addValue, setAddValue]     = useState('')

  function startEdit(c: Ceremony) {
    setEditingId(c.id)
    setEditValue(c.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  function saveEdit(id: string) {
    if (!editValue.trim()) return cancelEdit()
    updateCeremony.mutate({ id, name: editValue.trim() }, {
      onSuccess: () => { setEditingId(null); setEditValue('') },
    })
  }

  function saveAdd() {
    if (!addValue.trim()) { setShowAdd(false); return }
    createCeremony.mutate({ name: addValue.trim() }, {
      onSuccess: () => { setShowAdd(false); setAddValue('') },
    })
  }

  const list = ceremonies as Ceremony[]

  return (
    <div className="flex flex-col gap-4">

      <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18' }}>Ceremonies</div>

      <div style={{ border: '1px solid #F0EDE6', borderRadius: 8, overflow: 'hidden' }}>

        {list.length === 0 && !showAdd && (
          <div style={{ padding: '20px 14px', fontSize: 13, color: '#9B9890', textAlign: 'center' }}>
            No ceremonies yet. Add one below.
          </div>
        )}

        {list.map((c, i) => (
          <div
            key={c.id}
            className="group flex items-center justify-between"
            style={{ padding: '11px 14px', borderBottom: i < list.length - 1 || showAdd ? '1px solid #F0EDE6' : 'none' }}
          >
            {editingId === c.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter')  saveEdit(c.id)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  style={rowInputStyle}
                />
                <button type="button" onClick={() => saveEdit(c.id)} className="cursor-pointer" style={{ color: '#3A7A5A' }}>
                  <IconCheck size={15} />
                </button>
                <button type="button" onClick={cancelEdit} className="cursor-pointer" style={{ color: '#9B9890' }}>
                  <IconX size={15} />
                </button>
              </div>
            ) : (
              <>
                <span style={{ fontSize: 13, color: '#1C1B18' }}>{c.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="cursor-pointer"
                    style={{ color: '#9B9890', padding: 4 }}
                  >
                    <IconPencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCeremony.mutate(c.id)}
                    className="cursor-pointer"
                    style={{ color: '#C43C3C', padding: 4 }}
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {showAdd && (
          <div className="flex items-center gap-2" style={{ padding: '10px 14px' }}>
            <input
              autoFocus
              placeholder="Ceremony name…"
              value={addValue}
              onChange={e => setAddValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  saveAdd()
                if (e.key === 'Escape') { setShowAdd(false); setAddValue('') }
              }}
              style={rowInputStyle}
            />
            <button type="button" onClick={saveAdd} className="cursor-pointer" style={{ color: '#3A7A5A' }}>
              <IconCheck size={15} />
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setAddValue('') }} className="cursor-pointer" style={{ color: '#9B9890' }}>
              <IconX size={15} />
            </button>
          </div>
        )}

      </div>

      {!showAdd && (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="self-start flex items-center gap-1.5 cursor-pointer"
          style={{ fontSize: 13, color: '#3A7A5A', fontWeight: 500, padding: '4px 0', fontFamily: 'inherit' }}
        >
          <IconPlus size={14} />
          Add ceremony
        </button>
      )}

    </div>
  )
}
