import { OnboardingStep1 } from '@/components/auth/OnboardingStep1'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding/step-1')({
  component: OnboardingStep1,
})
