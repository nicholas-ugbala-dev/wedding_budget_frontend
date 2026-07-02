import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetSchema, type ResetInput } from '@/validations/auth'
import { useResetPassword } from '@/store/mutations/useAuth'
import { Field } from '@/components/ui/Field'
import { Route } from '@/routes/reset-password'
import { IconCheck } from '@tabler/icons-react'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const { mutate: reset, isPending } = useResetPassword()
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token },
  })

  const onSubmit = (data: ResetInput) => {
    reset(data, { onSuccess: () => setDone(true) })
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="w-[400px] text-center [animation:fadeUp_0.25s_ease]">
          <div className="w-14 h-14 rounded-full bg-brand-light border border-[#C8DDD4] inline-flex items-center justify-center mb-[18px]">
            <IconCheck size={24} color="#3A7A5A" />
          </div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px] mb-2">Password updated</div>
          <div className="text-[13px] text-text-secondary leading-relaxed mb-7">
            Your password has been changed. You can now sign in with your new password.
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: '/login' })}
            className="inline-flex items-center h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium px-7 cursor-pointer"
          >
            Sign in now →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-[400px] [animation:fadeUp_0.25s_ease]">

        <div className="text-center mb-7">
          <div className="w-11 h-11 rounded-[10px] bg-brand inline-flex items-center justify-center mb-3.5">
            <span className="text-white text-[17px] font-semibold tracking-[-0.5px]">M</span>
          </div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">Set new password</div>
          <div className="text-[13px] text-text-secondary mt-0.5">Choose a password with 8 or more characters</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-7 flex flex-col gap-3.5">

          <Field
            label="New password"
            type="password"
            placeholder="8+ characters"
            error={errors.password?.message}
            {...register('password')}
          />

          <Field
            label="Confirm password"
            type="password"
            placeholder="Repeat password"
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />

          <input type="hidden" {...register('token')} />

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending || !token}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? 'Updating...' : 'Update password'}
          </button>

        </div>
      </div>
    </div>
  )
}