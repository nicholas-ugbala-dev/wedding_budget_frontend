import { instance } from '@/services/axios'
import * as api from '@/services/api'

export const updateAccountRequest = (data: {
  first_name?: string
  last_name?: string
}) => instance.patch(api.SETTINGS_ACCOUNT, data).then(r => r.data.data)
