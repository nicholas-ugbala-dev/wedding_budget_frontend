import { instance } from '@/services/axios';
import * as api from '@/services/api';

export const fetchEvents = () =>
    instance.get(api.EVENTS).then(r => r.data.data);

export const createEvent  = (data: { name: string }) =>
    instance.post(api.EVENTS, data).then(r => r.data.data);

export const updateEvent  = ({ id, name }: { id: string; name: string }) =>
    instance.patch(api.EVENT_BY_ID(id), { name }).then(r => r.data.data);

export const deleteEvent  = (id: string) =>
    instance.delete(api.EVENT_BY_ID(id)).then(r => r.data);
