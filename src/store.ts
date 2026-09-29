import { create } from 'zustand'
import { TIERS, type Tier } from './config'

type State = {
  /** 0 = sắp tắt nguồn, 100 = no căng */
  fed: number
  /** mỗi lần tăng = thả thêm xu vào bát 3D */
  coinDrops: { id: number; count: number }[]
  selected: Tier
  powerSaving: boolean
  select: (t: Tier) => void
  dropCoins: (count: number) => void
  feed: (amount: number) => void
  starve: () => void
  togglePowerSaving: () => void
}

let dropId = 0

export const useSurvival = create<State>((set) => ({
  fed: 7,
  coinDrops: [],
  selected: TIERS[1],
  powerSaving: false,
  select: (selected) => set({ selected }),
  dropCoins: (count) =>
    set((s) => ({ coinDrops: [...s.coinDrops, { id: ++dropId, count }].slice(-6) })),
  feed: (amount) => set((s) => ({ fed: Math.min(100, s.fed + amount) })),
  // đói dần theo thời gian thực, nhưng không bao giờ chết hẳn (plot armor)
  starve: () => set((s) => ({ fed: Math.max(3, s.fed - 0.35) })),
  togglePowerSaving: () => set((s) => ({ powerSaving: !s.powerSaving })),
}))

export const moodOf = (fed: number) =>
  fed < 20 ? 'dying' : fed < 50 ? 'hungry' : fed < 85 ? 'okay' : 'blessed'

export const MOOD_TEXT: Record<ReturnType<typeof moodOf>, string> = {
  dying: 'CRITICAL · đang chạy bằng niềm tin',
  hungry: 'WARN · bụng kêu to hơn quạt laptop',
  okay: 'OK · đã có thể nghĩ về kiến trúc microservice',
  blessed: 'BLESSED · sẵn sàng refactor cả thế giới',
}
