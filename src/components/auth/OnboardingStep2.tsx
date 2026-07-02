
import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useOnboardCeremonies, useOnboardCurrencies } from '@/store/mutations/useAuth'
import { CEREMONY_PRESETS, CURRENCY_OPTIONS } from '@/lib/onboarding'
import { toast } from 'sonner'
import { IconPlus, IconX } from '@tabler/icons-react'

export function OnboardingStep2() {
  const navigate = useNavigate()
  const { mutate: saveCeremonies, isPending: savingCer } = useOnboardCeremonies()
  const { mutate: saveCurrencies, isPending: savingCur } = useOnboardCurrencies()

  const [ceremonies, setCeremonies] = useState<string[]>([])
  const [currencies, setCurrencies] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleCeremony = (name: string) =>
    setCeremonies(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name])

  const toggleCurrency = (code: string) =>
    setCurrencies(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code])

  const addCustom = () => {
    const name = customInput.trim()
    if (!name) return
    if (ceremonies.includes(name)) {
      toast.error(`"${name}" is already added`)
      return
    }
    setCeremonies(prev => [...prev, name])
    setCustomInput('')
    setShowCustomInput(false)
  }

  const removeCustom = (name: string) =>
    setCeremonies(prev => prev.filter(c => c !== name))

  const isPending = savingCer || savingCur

  const onFinish = () => {
    if (ceremonies.length === 0) {
      toast.error('Select at least one ceremony')
      return
    }
    saveCeremonies(
      { ceremony_names: ceremonies },
      {
        onSuccess: () =>
          saveCurrencies(
            { currency_codes: currencies },
            { onSuccess: () => navigate({ to: '/overview' }) },
          ),
      },
    )
  }

  // Ceremonies not in the preset list (user-added custom ones)
  const customCeremonies = ceremonies.filter(c => !CEREMONY_PRESETS.includes(c))

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-[480px] [animation:fadeUp_0.25s_ease]">

        <div className="text-center mb-7">
          <div className="w-11 h-11 rounded-[10px] bg-brand inline-flex items-center justify-center mb-3.5">
            <span className="text-white text-[17px] font-semibold tracking-[-0.5px]">M</span>
          </div>
          <div className="text-[11px] font-medium text-text-muted uppercase tracking-[0.08em] mb-1.5">Step 2 of 2</div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">Set up your ceremonies</div>
          <div className="text-[13px] text-text-secondary mt-0.5">Select all that apply — you can edit these later</div>
        </div>

        <div className="flex justify-center gap-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <div className="w-5 h-1.5 rounded-full bg-brand" />
        </div>

        <div className="bg-surface border border-border rounded-xl p-7 flex flex-col gap-6">

          {/* Ceremonies */}
          <div>
            <div className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em] mb-3">Ceremonies</div>
            <div className="flex flex-wrap gap-2">

              {/* Preset pills */}
              {CEREMONY_PRESETS.map(name => {
                const active = ceremonies.includes(name)
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleCeremony(name)}
                    className="h-8 px-3.5 rounded-full text-[12px] font-medium border cursor-pointer transition-colors"
                    style={{
                      background: active ? '#EEF5F1' : '#FAFAF8',
                      color: active ? '#2A5C41' : '#595650',
                      borderColor: active ? '#B8D9C8' : '#E8E6E0',
                    }}
                  >
                    {active ? '✓ ' : ''}{name}
                  </button>
                )
              })}

              {/* Custom ceremony pills */}
              {customCeremonies.map(name => (
                <span
                  key={name}
                  className="h-8 px-3 rounded-full text-[12px] font-medium border inline-flex items-center gap-1.5"
                  style={{ background: '#EEF5F1', color: '#2A5C41', borderColor: '#B8D9C8' }}
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removeCustom(name)}
                    className="cursor-pointer opacity-60 hover:opacity-100"
                  >
                    <IconX size={12} />
                  </button>
                </span>
              ))}

              {/* Add other button / inline input */}
              {showCustomInput ? (
                <div className="flex items-center gap-1.5 h-8">
                  <input
                    ref={inputRef}
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustom()}
                    placeholder="Ceremony name"
                    autoFocus
                    className="h-8 border border-border rounded-full px-3 text-[12px] bg-panel text-text-primary w-36 outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={addCustom}
                    className="h-8 w-8 rounded-full bg-brand text-white border-none cursor-pointer inline-flex items-center justify-center"
                  >
                    <IconPlus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCustomInput(false); setCustomInput('') }}
                    className="h-8 w-8 rounded-full border border-border bg-panel text-text-muted cursor-pointer inline-flex items-center justify-center"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="h-8 px-3.5 rounded-full text-[12px] font-medium border border-dashed cursor-pointer inline-flex items-center gap-1.5"
                  style={{ background: '#FAFAF8', color: '#9B9890', borderColor: '#C0BEB8' }}
                >
                  <IconPlus size={12} />
                  Other
                </button>
              )}

            </div>
          </div>

          {/* Currencies */}
          <div>
            <div className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em] mb-1">Payment wallets</div>
            <div className="text-[12px] text-text-muted mb-3">Add currencies you'll use to make payments</div>
            <div className="flex flex-wrap gap-2">
              {CURRENCY_OPTIONS.map(({ code, name }) => {
                const active = currencies.includes(code)
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleCurrency(code)}
                    className="h-8 px-3.5 rounded-full text-[12px] font-medium border cursor-pointer transition-colors"
                    style={{
                      background: active ? '#EEF5F1' : '#FAFAF8',
                      color: active ? '#2A5C41' : '#595650',
                      borderColor: active ? '#B8D9C8' : '#E8E6E0',
                    }}
                    title={name}
                  >
                    {active ? '✓ ' : ''}{code}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onFinish}
            disabled={isPending}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? 'Setting up...' : 'Finish setup →'}
          </button>

        </div>
      </div>
    </div>
  )
}
