import { createFileRoute } from '@tanstack/react-router'
import { OnboardingStep2 } from '@/components/auth/OnboardingStep2'

export const Route = createFileRoute('/onboarding/step-2')({
  component: OnboardingStep2,
})

