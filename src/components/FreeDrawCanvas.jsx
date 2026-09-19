import { useRef, useState } from 'react'
import { DRAW_VIEWBOX, strokeToPathD } from '../freeDraw.js'
import usePreventTouchScroll from '../usePreventTouchScroll.js'

// 「形」ステップの「フリーで描く」用、指でなぞって(またはドラッグして)線を描けるキャンバス。
// 描いた軌跡は、キャンバスの座標系(DRAW_VIEWBOX)上の点列として親に渡す。
export default function FreeDrawCanvas({ strokes, onChange }) {
  const svgRef = useRef(null)
  const drawingRef = useRef(false)
  const [liveStroke, setLiveStroke] = useState(null)

  usePreventTouchScroll(svgRef)

  const pointFromEvent = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * DRAW_VIEWBOX.width
    const y = ((e.clientY - rect.top) / rect.height) * DRAW_VIEWBOX.height
    return { x, y }
  }

  const handlePointerDown = (e) => {
    e.preventDefault()
    svgRef.current.setPointerCapture(e.pointerId)
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
    setLiveStroke((prev) => {
      if (prev && prev.length > 0) {
        onChange([...strokes, prev])
      }
      return null
    })
  }

  return (
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
  )
}
