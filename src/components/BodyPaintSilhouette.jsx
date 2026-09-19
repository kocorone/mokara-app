import { useEffect, useId, useRef, useState } from 'react'
import { BODY_PATH_D, BODY_VIEWBOX, HEAD_CIRCLE, strokeToPathD } from './bodyShapeDef.js'
import { lockPageScroll, unlockPageScroll } from '../touchScrollLock.js'

// 案内サインのようなシンプルな人型ピクトグラムを、指でなぞって(またはドラッグして)塗る操作用コンポーネント。
// 塗った軌跡は、シルエットの座標系(BODY_VIEWBOX)上の点列として親に渡す。
//
// なぞっている間にページがスクロールして線が点々に途切れないよう、次の対策を重ねている
// (「フリーで描く」用のFreeDrawCanvas.jsxと同じ考え方・同じ実装にしている):
// 1) 描画はPointer Eventsのみで扱い、なぞり始めにsetPointerCaptureして指がキャンバスの
//    外に出ても操作を追従できるようにする。
// 2) <svg>を囲むdiv(.body-paint-wrap)にtouch-action: noneを設定する。WebKit(Safari)には
//    <svg>要素自体にtouch-actionが効かない既知の不具合があるため、HTML要素であるdiv側に
//    かけることで確実に効かせる。
// 3) なぞっている間だけbody/html全体のtouch-actionも一時的にnoneにし(touchScrollLock)、
//    指がキャンバスの外へはみ出した場合でもページがスクロールしないようにする。
export default function BodyPaintSilhouette({ strokes, onChange }) {
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const clipId = useId()
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
    const x = ((e.clientX - rect.left) / rect.width) * BODY_VIEWBOX.width
    const y = ((e.clientY - rect.top) / rect.height) * BODY_VIEWBOX.height
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
    <div ref={wrapRef} className="body-paint-wrap">
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
    </div>
  )
}
