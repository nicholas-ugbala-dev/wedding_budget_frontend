import { instance } from '@/services/axios'
import * as api from '@/services/api'
import type { Event } from '@/types/event'

export type EventPayload = {
  name: string
  event_type?: string
  date?: string
  location?: string
  vendor_currency?: string
  budget?: number
  client_id?: string
}

export const fetchEvents = (): Promise<Event[]> =>
  instance.get(api.EVENTS).then(r => r.data.data)

export const createEvent = (data: EventPayload): Promise<Event> =>
  instance.post(api.EVENTS, data).then(r => r.data.data)

export const updateEvent = ({ id, ...data }: { id: string } & Partial<EventPayload>): Promise<Event> =>
  instance.patch(api.EVENT_BY_ID(id), data).then(r => r.data.data)

export const deleteEvent = (id: string) =>
  instance.delete(api.EVENT_BY_ID(id)).then(r => r.data)
