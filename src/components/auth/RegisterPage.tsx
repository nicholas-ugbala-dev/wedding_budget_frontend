import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/validations/auth'
import { useRegister } from '@/store/mutations/useAuth'
import { Field, SelectField } from '@/components/ui/Field'

export function RegisterPage() {
  const navigate = useNavigate()
  const { mutate: register_, isPending } = useRegister()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { account_type: 'couple' },
  })
  const accountType = watch('account_type')

  const onSubmit = (data: RegisterInput) => {
    register_(data, {
      onSuccess: (res) => navigate({
        to: res.user?.account_type === 'planner' ? '/onboarding/planner-step-1' : '/onboarding/step-1',
      }),
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-[420px] [animation:fadeUp_0.25s_ease]">

        {/* Logo + heading */}
        <div className="text-center mb-7">
          <div className="w-11 h-11 rounded-[10px] bg-brand inline-flex items-center justify-center mb-3.5">
            <span className="text-white text-[17px] font-semibold tracking-[-0.5px]">M</span>
          </div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">Create account</div>
          <div className="text-[13px] text-text-secondary mt-0.5">Start tracking your wedding budget</div>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-7 flex flex-col gap-3.5">

          {/* Name row */}
          <div className="grid grid-cols-2 gap-2.5">
            <Field
              label="First name"
              placeholder="Alex"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Field
              label="Last name"
              placeholder="Morgan"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Field
            label="Password"
            type="password"
            placeholder="8+ characters"
            error={errors.password?.message}
            {...register('password')}
          />

          <SelectField
            label="Account type"
            error={errors.account_type?.message}
            value={accountType}
            onChange={v => setValue('account_type', v as 'couple' | 'planner', { shouldValidate: true })}
            options={[
              { value: 'couple',  label: 'Personal — planning my own events' },
              { value: 'planner', label: 'Event planner — managing clients' },
            ]}
          />

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating account...' : 'Create account →'}
          </button>

          <div className="text-center">
            <span className="text-[12px] text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-brand font-medium no-underline">
                Sign in
              </Link>
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}