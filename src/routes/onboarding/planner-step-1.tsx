import { OnboardingPlannerStep1 } from '@/components/auth/OnboardingPlannerStep1'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding/planner-step-1')({
  component: OnboardingPlannerStep1,
})
