import { instance } from '@/services/axios';
import * as api from '@/services/api';

export const fetchCeremonies = () => 
    instance.get(api.CEREMONIES).then(r => r.data.data);

export const createCeremony  = (data: { name: string }) => 
    instance.post(api.CEREMONIES, data).then(r => r.data.data);

export const updateCeremony  = ({ id, name }: { id: string; name: string }) => 
    instance.patch(api.CEREMONY_BY_ID(id), { name }).then(r => r.data.data);

export const deleteCeremony  = (id: string) => 
    instance.delete(api.CEREMONY_BY_ID(id)).then(r => r.data);