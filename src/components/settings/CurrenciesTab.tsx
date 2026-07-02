import { useState } from 'react'
import { IconPlus, IconTrash, IconX } from '@tabler/icons-react'
import { AppSelect } from '@/components/ui/AppSelect'
import { useGetCurrencies } from '@/store/queries/useCurrencies'
import { useGetMe } from '@/store/queries/useAuth'
import { useAddCurrency, useRemoveCurrency } from '@/store/mutations/useCurrencies'
import { CURRENCY_META } from '@/lib/format'

interface UserCurrency {
  id?: string
  currency_code: string
}

export function CurrenciesTab() {
  const { data: user }             = useGetMe()
  const { data: currencies = [] }  = useGetCurrencies()
  const addCurrency                = useAddCurrency()
  const removeCurrency             = useRemoveCurrency()

  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState('')

  const baseCurrency = user?.base_currency ?? 'NGN'
  const list         = currencies as UserCurrency[]
  const activeCodes  = new Set(list.map(c => c.currency_code))
  const foreign      = list.filter(c => c.currency_code !== baseCurrency)

  const available = Object.entries(CURRENCY_META)
    .filter(([code]) => !activeCodes.has(code))
    .map(([code, meta]) => ({ code, name: meta.name }))

  const baseMeta = CURRENCY_META[baseCurrency] ?? { name: baseCurrency, symbol: baseCurrency }

  function handleAdd() {
    if (!selected) return
    addCurrency.mutate({ currency_code: selected }, {
      onSuccess: () => { setShowAdd(false); setSelected('') },
    })
  }

  return (
    <div className="flex flex-col gap-4">

      <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18' }}>Payment wallets</div>

      <div style={{ border: '1px solid #F0EDE6', borderRadius: 8, overflow: 'hidden' }}>

        {/* Base currency — locked */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '12px 14px',
            background: '#FAFAF8',
            borderBottom: foreign.length > 0 || showAdd ? '1px solid #F0EDE6' : 'none',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18' }}>
              {baseCurrency} · {baseMeta.name}
            </div>
            <div style={{ fontSize: 11, color: '#9B9890', marginTop: 2 }}>Base currency · cannot be removed</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', background: '#EEF5F1', color: '#2A5C41', borderRadius: 99, letterSpacing: '0.05em' }}>
            PRIMARY
          </span>
        </div>

        {/* Foreign wallets */}
        {foreign.map((c, i) => {
          const meta = CURRENCY_META[c.currency_code]
          return (
            <div
              key={c.currency_code}
              className="group flex items-center justify-between"
              style={{
                padding: '12px 14px',
                borderBottom: i < foreign.length - 1 || showAdd ? '1px solid #F0EDE6' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18' }}>
                  {c.currency_code}{meta ? ` · ${meta.name}` : ''}
                </div>
                {meta && <div style={{ fontSize: 11, color: '#9B9890', marginTop: 2 }}>{meta.symbol}</div>}
              </div>
              <button
                type="button"
                onClick={() => removeCurrency.mutate(c.currency_code)}
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                style={{ color: '#C43C3C', padding: 4 }}
              >
                <IconTrash size={14} />
              </button>
            </div>
          )
        })}

        {/* Add row */}
        {showAdd && (
          <div className="flex items-center gap-2" style={{ padding: '10px 14px' }}>
            <AppSelect
              value={selected}
              onChange={setSelected}
              placeholder="Select currency…"
              options={available.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
              style={{ height: 32, borderRadius: 5, fontSize: 13 }}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selected || addCurrency.isPending}
              style={{
                height: 32, padding: '0 14px',
                background: '#3A7A5A', color: 'white',
                border: 'none', borderRadius: 5,
                fontSize: 12, fontWeight: 500,
                cursor: selected ? 'pointer' : 'default',
                opacity: selected ? 1 : 0.4,
                fontFamily: 'inherit',
              }}
            >
              {addCurrency.isPending ? 'Adding…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setSelected('') }}
              className="cursor-pointer"
              style={{ color: '#9B9890', padding: 4 }}
            >
              <IconX size={15} />
            </button>
          </div>
        )}

      </div>

      {!showAdd && available.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="self-start flex items-center gap-1.5 cursor-pointer"
          style={{ fontSize: 13, color: '#3A7A5A', fontWeight: 500, padding: '4px 0', fontFamily: 'inherit' }}
        >
          <IconPlus size={14} />
          Add wallet
        </button>
      )}

    </div>
  )
}
