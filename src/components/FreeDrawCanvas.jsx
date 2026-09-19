import { useEffect, useRef, useState } from 'react'
import { DRAW_VIEWBOX, strokeToPathD } from '../freeDraw.js'
import { lockPageScroll, unlockPageScroll } from '../touchScrollLock.js'

// 「形」ステップの「フリーで描く」用、指でなぞって(またはドラッグして)線を描けるキャンバス。
// 描いた軌跡は、キャンバスの座標系(DRAW_VIEWBOX)上の点列として親に渡す。
//
// なぞっている間にページがスクロールして線が点々に途切れないよう、次の対策を重ねている:
// 1) 描画はPointer Eventsのみで扱い、なぞり始めにsetPointerCaptureして指がキャンバスの
//    外に出ても操作を追従できるようにする。
// 2) <svg>を囲むdiv(.free-draw-wrap)にtouch-action: noneを設定する。WebKit(Safari)には
//    <svg>要素自体にtouch-actionが効かない既知の不具合があるため、HTML要素であるdiv側に
//    かけることで確実に効かせる。
// 3) なぞっている間だけbody/html全体のtouch-actionも一時的にnoneにし(touchScrollLock)、
//    指がキャンバスの外へはみ出した場合でもページがスクロールしないようにする。
export default function FreeDrawCanvas({ strokes, onChange }) {
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const drawingRef = useRef(false)
  const [liveStroke, setLiveStroke] = useState(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const preventScroll = (e) => e.preventDefault()
    el.addEventListener('touchstart', preventScroll, { passive: false })
    el.addEventListener('touchmove', preventScroll, { passive: false })
    return () => {
      el.removeEventListener('touchstart', preventScroll)
      el.removeEventListener('touchmove', preventScroll)
      unlockPageScroll()
    }
  }, [])

  const pointFromEvent = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * DRAW_VIEWBOX.width
    const y = ((e.clientY - rect.top) / rect.height) * DRAW_VIEWBOX.height
    return { x, y }
  }

  const handlePointerDown = (e) => {
    e.preventDefault()
    try {
      svgRef.current.setPointerCapture(e.pointerId)
    } catch {
      // キャプチャできない環境でも、描画そのものは続行する
    }
    lockPageScroll()
    drawingRef.current = true
    setLiveStroke([pointFromEvent(e)])
  }

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return
    e.preventDefault()
    setLiveStroke((prev) => (prev ? [...prev, pointFromEvent(e)] : [pointFromEvent(e)]))
  }

  const finishStroke = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    unlockPageScroll()
    setLiveStroke((prev) => {
      if (prev && prev.length > 0) {
        onChange([...strokes, prev])
      }
      return null
    })
  }

  return (
    <div ref={wrapRef} className="free-draw-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${DRAW_VIEWBOX.width} ${DRAW_VIEWBOX.height}`}
        role="img"
        aria-label="自由に線を描けるキャンバス"
        className="free-draw-svg"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        onPointerCancel={finishStroke}
      >
        <rect x="0" y="0" width={DRAW_VIEWBOX.width} height={DRAW_VIEWBOX.height} rx="14" className="free-draw-bg" />
        {strokes.map((pts, i) => (
          <path key={i} d={strokeToPathD(pts)} className="free-draw-stroke" />
        ))}
        {liveStroke && <path d={strokeToPathD(liveStroke)} className="free-draw-stroke" />}
      </svg>
    </div>
  )
}
