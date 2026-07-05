import { useState } from 'react'
import { IconUser, IconWallet } from '@tabler/icons-react'
import { AccountTab } from './AccountTab'
import { CurrenciesTab } from './CurrenciesTab'
import { useGetMe } from '@/store/queries/useAuth'

type Tab = 'account' | 'currencies'

export function SettingsPage() {
  const { data: user }  = useGetMe()
  const isPlanner       = user?.account_type === 'planner'
  const [tab, setTab]   = useState<Tab>('account')

  const tabs = [
    { id: 'account' as Tab,    label: 'Account',    Icon: IconUser },
    ...(!isPlanner ? [{ id: 'currencies' as Tab, label: 'Currencies', Icon: IconWallet }] : []),
  ]

  return (
    <div className="px-8 py-7 flex flex-col gap-5">

      <div style={{ fontSize: 20, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.3px' }}>Settings</div>

      <div className="flex gap-6 items-start">

        {/* Left tab nav */}
        <div className="flex flex-col gap-1 shrink-0" style={{ width: 160 }}>
          {tabs.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="flex items-center gap-2.5 cursor-pointer text-left w-full transition-colors"
                style={{
                  padding: '8px 12px',
                  borderRadius: 7,
                  border: `1px solid ${active ? '#E8E6E0' : 'transparent'}`,
                  background: active ? 'white' : 'transparent',
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? '#1C1B18' : '#9B9890',
                  fontFamily: 'inherit',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            )
          })}
        </div>

        {/* Right content card */}
        <div className="flex-1 bg-surface border border-border rounded-[10px]" style={{ padding: '24px 28px' }}>
          {tab === 'account'    && <AccountTab />}
          {tab === 'currencies' && !isPlanner && <CurrenciesTab />}
        </div>

      </div>
    </div>
  )
}
