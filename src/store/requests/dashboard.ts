import { instance } from '@/services/axios';
import * as api from '@/services/api';

export const fetchDashboard = (params?: { event_id?: string }) =>
  instance.get(api.DASHBOARD, { params }).then(r => r.data.data);
