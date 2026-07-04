import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/validations/auth'
import { useLogin } from '@/store/mutations/useAuth'
import { Field } from '@/components/ui/Field'

export function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    login(data, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: (res: any) => {
        const to = res?.user?.account_type === 'planner' ? '/clients' : '/overview'
        navigate({ to })
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-[400px] [animation:fadeUp_0.25s_ease]">

        {/* Logo + heading */}
        <div className="text-center mb-7">
          <div className="w-11 h-11 rounded-[10px] bg-brand inline-flex items-center justify-center mb-3.5">
            <span className="text-white text-[17px] font-semibold tracking-[-0.5px]">M</span>
          </div>
          <div className="text-[22px] font-semibold text-text-primary tracking-[-0.3px]">Welcome back</div>
          <div className="text-[13px] text-text-secondary mt-0.5">Sign in to Munachi</div>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-7 flex flex-col gap-3.5">

          {/* Email */}
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password */}
          <Field
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="h-10 bg-text-primary text-white border-none rounded-[7px] text-[13px] font-medium w-full mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Links */}
          <div className="flex flex-col items-center gap-1.5 mt-0.5">
            <Link
              to="/forgot-password"
              className="text-[12px] text-text-secondary no-underline hover:text-text-primary"
            >
              Forgot your password?
            </Link>
            <span className="text-[12px] text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand font-medium no-underline">
                Create one
              </Link>
            </span>
          </div>

        </div>

        {/* Tagline */}
        <div className="text-center mt-5 text-[11px] text-text-faint">
          Every payment, perfectly tracked.
        </div>

      </div>
    </div>
  )
}
