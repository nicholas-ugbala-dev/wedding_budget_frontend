import { instance } from '@/services/axios'
import * as api from '@/services/api'
import type {
  LoginInput,
  RegisterInput,
  Onboard1Input,
  ForgotInput,
  ResetInput,
} from '@/validations/auth'
import type { User } from '@/types/auth'

interface AuthResponse {
  token: string
  user: User
}

export const loginRequest = (data: LoginInput): Promise<AuthResponse> =>
  instance.post(api.AUTH_LOGIN, data).then(r => r.data.data)

export const registerRequest = (data: RegisterInput): Promise<AuthResponse> =>
  instance.post(api.AUTH_REGISTER, data).then(r => r.data.data)

export const getMeRequest = () => instance.get(api.AUTH_ME).then(r => r.data.data)

export const onboard1Request = (data: Onboard1Input) =>
  instance.patch(api.AUTH_ONBOARDING, data).then(r => r.data.data)

export const onboardEventsRequest = (data: { event_names: string[] }) =>
  instance.post(api.AUTH_ONBOARDING_EVENTS, { events: data.event_names }).then(r => r.data.data)

export const onboardCurrRequest = (data: { currency_codes: string[] }) =>
  instance
    .post(api.AUTH_ONBOARDING_CURS, { currencies: data.currency_codes })
    .then(r => r.data.data)

export const forgotRequest = (data: ForgotInput) =>
  instance.post(api.AUTH_FORGOT, data).then(r => r.data.data)

export const resetRequest = (data: ResetInput) =>
  instance
    .post(api.AUTH_RESET, { token: data.token, new_password: data.password })
    .then(r => r.data.data)
