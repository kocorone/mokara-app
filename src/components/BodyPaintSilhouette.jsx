import { useId, useRef, useState } from 'react'
import { BODY_PATH_D, BODY_VIEWBOX, HEAD_CIRCLE, strokeToPathD } from './bodyShapeDef.js'

// 案内サインのようなシンプルな人型ピクトグラムを、指でなぞって(またはドラッグして)塗る操作用コンポーネント。
// 塗った軌跡は、シルエットの座標系(BODY_VIEWBOX)上の点列として親に渡す。
export default function BodyPaintSilhouette({ strokes, onChange }) {
  const svgRef = useRef(null)
  const clipId = useId()
  const drawingRef = useRef(false)
  const [liveStroke, setLiveStroke] = useState(null)

  const pointFromEvent = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * BODY_VIEWBOX.width
    const y = ((e.clientY - rect.top) / rect.height) * BODY_VIEWBOX.height
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
      viewBox={`0 0 ${BODY_VIEWBOX.width} ${BODY_VIEWBOX.height}`}
      role="img"
      aria-label="体のシルエット。指でなぞると色を塗れます"
      className="body-paint-svg"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishStroke}
      onPointerLeave={finishStroke}
      onPointerCancel={finishStroke}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={BODY_PATH_D} />
          <circle cx={HEAD_CIRCLE.cx} cy={HEAD_CIRCLE.cy} r={HEAD_CIRCLE.r} />
        </clipPath>
      </defs>
      <circle cx={HEAD_CIRCLE.cx} cy={HEAD_CIRCLE.cy} r={HEAD_CIRCLE.r} className="body-silhouette-fill" />
      <path d={BODY_PATH_D} className="body-silhouette-fill" />
      <g clipPath={`url(#${clipId})`}>
        {strokes.map((pts, i) => (
          <path key={i} d={strokeToPathD(pts)} className="body-paint-stroke" />
        ))}
        {liveStroke && <path d={strokeToPathD(liveStroke)} className="body-paint-stroke" />}
      </g>
    </svg>
  )
}
