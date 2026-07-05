import { EventsPage } from '@/components/events/EventsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/events')({
  component: EventsPage,
})
