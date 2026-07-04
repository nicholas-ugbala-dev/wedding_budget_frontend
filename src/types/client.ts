export interface Client {
  id: string
  user_id: string
  first_name: string
  last_name: string | null
  currency_code: string
  created_at: string
  updated_at: string
  next_event_name: string | null
  next_event_date: string | null
  total_budget: number
}
