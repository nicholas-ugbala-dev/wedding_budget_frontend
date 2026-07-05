import { instance } from '@/services/axios'
import * as api from '@/services/api'

export const fetchCurrencies = (params?: { client_id?: string }) =>
    instance.get(api.CURRENCIES, { params }).then(r => r.data.data);

export const addCurrency = (data: { currency_code: string }) =>
    instance.post(api.CURRENCIES, data).then(r => r.data.data);

export const removeCurrency = (code: string) =>
    instance.delete(api.CURRENCY_BY_CODE(code)).then(r => r.data);