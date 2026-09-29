import { create } from 'zustand'

export type GameId = 'toss' | 'bugs'
export type Status = 'idle' | 'playing' | 'over'

export const GAME_SECONDS: Record<GameId, number> = { toss: 30, bugs: 25 }
const BEST_KEY = 'dfs-arcade-best'

function loadBest(): Record<GameId, number> {
  try {
    return { toss: 0, bugs: 0, ...JSON.parse(localStorage.getItem(BEST_KEY) || '{}') }
  } catch {
    return { toss: 0, bugs: 0 }
  }
}

type ArcadeState = {
  game: GameId
  status: Status
  score: number
  timeLeft: number
  best: Record<GameId, number>
  /** tăng mỗi lần ghi điểm — scene 3D dùng để kích hoạt hiệu ứng */
  hitId: number
  setGame: (g: GameId) => void
  start: () => void
  tick: (dt: number) => void
  hit: (points?: number) => void
  end: () => void
}

export const useArcade = create<ArcadeState>((set, get) => ({
  game: 'toss',
  status: 'idle',
  score: 0,
  timeLeft: GAME_SECONDS.toss,
  best: loadBest(),
  hitId: 0,
  setGame: (game) => set({ game, status: 'idle', score: 0, timeLeft: GAME_SECONDS[game] }),
  start: () => set((s) => ({ status: 'playing', score: 0, timeLeft: GAME_SECONDS[s.game] })),
  tick: (dt) => {
    const s = get()
    if (s.status !== 'playing') return
    const timeLeft = Math.max(0, s.timeLeft - dt)
    set({ timeLeft })
    if (timeLeft === 0) get().end()
  },
  hit: (points = 1) => set((s) => (s.status === 'playing' ? { score: s.score + points, hitId: s.hitId + 1 } : {})),
  end: () =>
    set((s) => {
      const best = { ...s.best, [s.game]: Math.max(s.best[s.game], s.score) }
      try {
        localStorage.setItem(BEST_KEY, JSON.stringify(best))
      } catch {
        /* ignore */
      }
      return { status: 'over', best }
    }),
}))
