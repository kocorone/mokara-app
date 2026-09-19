import { useEffect } from 'react'

// 指でキャンバスをなぞっている間にページがスクロールしてしまうと、
// タッチの連続した移動が正しく取得できず、線が点々に途切れてしまう。
// CSSのtouch-actionだけでは端末によって効かないことがあるため、
// 対象要素上のtouchmoveを非passiveリスナーで確実に止める。
export default function usePreventTouchScroll(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const handleTouchMove = (e) => {
      e.preventDefault()
    }
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => {
      el.removeEventListener('touchmove', handleTouchMove)
    }
  }, [ref])
}
