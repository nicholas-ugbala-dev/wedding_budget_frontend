export interface Event {
  id: string
  user_id: string
  name: string
  event_type: string | null
  date: string | null
  location: string | null
  vendor_currency: string | null
  budget: number | null
  client_id: string | null
  created_at: string
}
