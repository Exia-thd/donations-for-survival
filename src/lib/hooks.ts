import { useEffect, useState } from 'react'
import { getT } from '../i18n'

export function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Gắn --mx/--my vào phần tử để làm hiệu ứng spotlight theo chuột. */
export function spotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/** Chuyển trạng thái có View Transition API nếu trình duyệt hỗ trợ. */
export function withViewTransition(update: () => void) {
  if (!document.startViewTransition || prefersReducedMotion()) return update()
  document.startViewTransition(update)
}

/** Đổi tiêu đề tab khi người xem bỏ đi. */
export function useGuiltTrip() {
  useEffect(() => {
    const onVis = () => {
      const t = getT()
      document.title = document.hidden ? t.meta.guilt : t.meta.title
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
}

export function useTicker(ms: number) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setN((x) => x + 1), ms)
    return () => clearInterval(id)
  }, [ms])
  return n
}

/** true khi phần tử đang nằm trong (hoặc gần) khung nhìn — dùng để dừng render WebGL khi khuất. */
export function useInView<T extends Element>(rootMargin = '100px') {
  const [el, setEl] = useState<T | null>(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [el, rootMargin])
  return [setEl, inView] as const
}
