import { instance } from '@/services/axios'
import * as api from '@/services/api'

export const updateAccountRequest = (data: {
  event_name?: string
  event_date?: string
  wedding_location?: string
}) => instance.patch(api.SETTINGS_ACCOUNT, data).then(r => r.data.data)
