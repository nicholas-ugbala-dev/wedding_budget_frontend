import { create } from 'zustand'
import type { Client } from '@/types/client'

interface ClientStore {
  activeClient: Client | null
  setActiveClient: (client: Client) => void
  clearActiveClient: () => void
}

export const useClientStore = create<ClientStore>((set) => ({
  activeClient: null,
  setActiveClient: (client) => set({ activeClient: client }),
  clearActiveClient: () => set({ activeClient: null }),
}))
