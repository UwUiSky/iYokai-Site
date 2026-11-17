import { create } from 'zustand'
import type { ProtocolId } from '../data/protocols'
import type { Tier } from '../lib/quality'

export type Phase = 'intro' | 'hub' | 'protocol'

type AppState = {
  phase: Phase
  protocol: ProtocolId
  section: number
  tier: Tier
  enter: () => void
  open: (protocol: ProtocolId) => void
  backToHub: () => void
  setSection: (section: number) => void
  setTier: (tier: Tier) => void
}

export const useApp = create<AppState>((set) => ({
  phase: 'intro',
  protocol: 'discord',
  section: 0,
  tier: 0,
  enter: () => set({ phase: 'hub' }),
  open: (protocol) => set({ phase: 'protocol', protocol, section: 0 }),
  backToHub: () => set({ phase: 'hub', section: 0 }),
  setSection: (section) => set({ section }),
  setTier: (tier) => set({ tier }),
}))
