import { useEffect, useRef } from 'react'
import { DRAW_VIEWBOX } from '../freeDraw.js'
import { cssVar } from '../cssVar.js'
import { lockPageScroll, unlockPageScroll } from '../touchScrollLock.js'

// 「形」ステップの「フリーで描く」用キャンバス。
//
// 素のHTML <canvas> + 素のPointer Eventsだけで実装している(SVG・状態管理ライブラリ不使用)。
// なぞっている間はReactの状態更新(setState)を一切行わず、pointermoveのたびに
// Canvas 2Dへ直接1本の線分を描き足すだけにしている。SVGの座標配列をReactの状態にして
// 1点ごとに再描画・再レンダリングする実装だと、実機(特にモバイル)ではその再描画の
// 負荷でpointermoveの取りこぼしが起き、線が点々に途切れることがあるため。
// なぞり終わった時(pointerup)にだけ、完成した1本分の軌跡をonChangeで親に伝える。
const LINE_WIDTH = 6

function readColors() {
  return {
    surface: cssVar('--color-surface', '#ffffff'),
    border: cssVar('--color-border', '#e4dcd0'),
    primary: cssVar('--color-primary', '#c39a82'),
  }
}

function drawBackground(ctx, colors) {
  const r = 14
  const w = DRAW_VIEWBOX.width
  const h = DRAW_VIEWBOX.height
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.arcTo(w, 0, w, h, r)
  ctx.arcTo(w, h, 0, h, r)
  ctx.arcTo(0, h, 0, 0, r)
  ctx.arcTo(0, 0, w, 0, r)
  ctx.closePath()
  ctx.fillStyle = colors.surface
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = colors.border
  ctx.stroke()
}

function drawStroke(ctx, pts, colors) {
  if (!pts || pts.length === 0) return
  ctx.strokeStyle = colors.primary
  ctx.fillStyle = colors.primary
  ctx.lineWidth = LINE_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (pts.length === 1) {
    ctx.beginPath()
    ctx.arc(pts[0].x, pts[0].y, LINE_WIDTH / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y))
  ctx.stroke()
}

export default function FreeDrawCanvas({ strokes, onChange }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const colorsRef = useRef(null)
  const strokesRef = useRef(strokes)
  const drawingRef = useRef(false)
  const currentStrokeRef = useRef([])

  strokesRef.current = strokes

  const redrawAll = () => {
    const ctx = ctxRef.current
    if (!ctx || !colorsRef.current) return
    ctx.clearRect(0, 0, DRAW_VIEWBOX.width, DRAW_VIEWBOX.height)
    drawBackground(ctx, colorsRef.current)
    strokesRef.current.forEach((pts) => drawStroke(ctx, pts, colorsRef.current))
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return undefined

    const setup = () => {
      const displayWidth = wrap.clientWidth
      const displayHeight = displayWidth * (DRAW_VIEWBOX.height / DRAW_VIEWBOX.width)
      const dpr = window.devicePixelRatio || 1
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`
      canvas.width = Math.round(displayWidth * dpr)
      canvas.height = Math.round(displayHeight * dpr)
      const ctx = canvas.getContext('2d')
      const cssScale = displayWidth / DRAW_VIEWBOX.width
      ctx.setTransform(dpr * cssScale, 0, 0, dpr * cssScale, 0, 0)
      ctxRef.current = ctx
      colorsRef.current = readColors()
      redrawAll()
    }

    setup()
    window.addEventListener('resize', setup)
    return () => window.removeEventListener('resize', setup)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    redrawAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes])

  const pointFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * DRAW_VIEWBOX.width
    const y = ((e.clientY - rect.top) / rect.height) * DRAW_VIEWBOX.height
    return { x, y }
  }

  const handlePointerDown = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      // キャプチャできない環境でも、描画そのものは続行する
    }
    lockPageScroll()
    drawingRef.current = true
    const p = pointFromEvent(e)
    currentStrokeRef.current = [p]
    drawStroke(ctxRef.current, currentStrokeRef.current, colorsRef.current)
  }

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const ctx = ctxRef.current
    const prev = currentStrokeRef.current[currentStrokeRef.current.length - 1]
    const next = pointFromEvent(e)
    currentStrokeRef.current.push(next)
    ctx.strokeStyle = colorsRef.current.primary
    ctx.lineWidth = LINE_WIDTH
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(next.x, next.y)
    ctx.stroke()
  }

  const finishStroke = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    unlockPageScroll()
    if (currentStrokeRef.current.length > 0) {
      onChange([...strokesRef.current, currentStrokeRef.current])
    }
    currentStrokeRef.current = []
  }

  return (
    <div ref={wrapRef} className="free-draw-wrap">
      <canvas
        ref={canvasRef}
        className="free-draw-canvas"
        role="img"
        aria-label="自由に線を描けるキャンバス"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        onPointerCancel={finishStroke}
      />
    </div>
  )
}
