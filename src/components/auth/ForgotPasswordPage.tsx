import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotSchema, type ForgotInput } from '@/validations/auth'
import { useForgotPassword } from '@/store/mutations/useAuth'
import { Field } from '@/components/ui/Field'
import { IconCheck } from '@tabler/icons-react'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { mutate: forgot, isPending } = useForgotPassword()

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = (data: ForgotInput) => {
    forgot(data, { onSuccess: () => setSent(true) })
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="w-[400px] text-center [animation:fadeUp_0.25s_ease]">
          <div className="w-14 h-14 rounded-full bg-brand-light border border-[#C8DDD4] inline-flex items-center justify-center mb-[18px]">
            <IconCheck size={24} color="#3A7A5A" />
          </div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px] mb-2">Check your email</div>
          <div className="text-[13px] text-text-secondary leading-relaxed mb-7">
            We sent a reset link to your email address. It expires in 1 hour.
          </div>
          <div className="mt-3.5">
            <Link to="/login" className="text-[12px] text-text-secondary no-underline hover:text-text-primary">
              Back to sign in
            </Link>
          </div>
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
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">Reset your password</div>
          <div className="text-[13px] text-text-secondary mt-0.5">We'll send a reset link to your email</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-7 flex flex-col gap-3.5">
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? 'Sending...' : 'Send reset link'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-[12px] text-text-secondary no-underline hover:text-text-primary">
              Back to sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}