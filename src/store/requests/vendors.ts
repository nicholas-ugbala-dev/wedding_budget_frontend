import { instance } from '@/services/axios'
import * as api from '@/services/api'

export const fetchVendors = (params?: { search?: string }) =>
  instance.get(api.VENDORS, { params }).then(r => r.data.data)
