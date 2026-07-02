import { instance } from '@/services/axios'
import * as api from '@/services/api'

export const fetchCategories = (params?: { ceremony_id?: string }) =>
  instance.get(api.CATEGORIES, { params }).then(r => r.data.data)
