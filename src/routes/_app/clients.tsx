import { ClientsPage } from '@/components/clients/ClientsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/clients')({
  component: ClientsPage,
})
