
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboard1Schema, type Onboard1Input } from '@/validations/auth'
import { useOnboard1 } from '@/store/mutations/useAuth'
import { Field, SelectField } from '@/components/ui/Field'
import { CURRENCY_OPTIONS } from '@/lib/onboarding'

export function OnboardingStep1() {
  const navigate = useNavigate()
  const { mutate: onboard, isPending } = useOnboard1()

  const { register, handleSubmit, formState: { errors } } = useForm<Onboard1Input>({
    resolver: zodResolver(onboard1Schema),
  })

  const onSubmit = (data: Onboard1Input) => {
    onboard(data, {
      onSuccess: () => navigate({ to: '/onboarding/step-2' }),
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-[480px] [animation:fadeUp_0.25s_ease]">

        {/* Logo + step indicator */}
        <div className="text-center mb-7">
          <div className="w-11 h-11 rounded-[10px] bg-brand inline-flex items-center justify-center mb-3.5">
            <span className="text-white text-[17px] font-semibold tracking-[-0.5px]">M</span>
          </div>
          <div className="text-[11px] font-medium text-text-muted uppercase tracking-[0.08em] mb-1.5">Step 1 of 2</div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">Tell us about your event</div>
          <div className="text-[13px] text-text-secondary mt-0.5">We'll use this to personalise your budget tracker</div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          <div className="w-5 h-1.5 rounded-full bg-brand" />
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-7 flex flex-col gap-3.5">

          <Field
            label="Event name"
            placeholder="e.g. Munachi & Bello Wedding"
            error={errors.event_name?.message}
            {...register('event_name')}
          />

          <Field
            label="Event date"
            type="date"
            error={errors.event_date?.message}
            {...register('event_date')}
          />

          <Field
            label="Wedding location"
            placeholder="e.g. Lagos, Nigeria"
            error={errors.wedding_location?.message}
            {...register('wedding_location')}
          />

          <SelectField
            label="Base currency"
            error={errors.base_currency?.message}
            {...register('base_currency')}
          >
            <option value="">Select currency</option>
            {CURRENCY_OPTIONS.map(c => (
              <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
            ))}
          </SelectField>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving...' : 'Continue →'}
          </button>

        </div>
      </div>
    </div>
  )
}