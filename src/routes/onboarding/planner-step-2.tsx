import { OnboardingPlannerStep2 } from '@/components/auth/OnboardingPlannerStep2'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding/planner-step-2')({
  component: OnboardingPlannerStep2,
})
