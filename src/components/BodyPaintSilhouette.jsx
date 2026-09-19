import { useEffect, useRef } from 'react'
import { PAINT_VIEWBOX, BODY_OFFSET, getBodyClipPath } from './bodyShapeDef.js'
import { cssVar } from '../cssVar.js'
import { lockPageScroll, unlockPageScroll } from '../touchScrollLock.js'

// 案内サインのようなシンプルな人型ピクトグラムを、指でなぞって(またはドラッグして)塗る操作用コンポーネント。
//
// 素のHTML <canvas> + 素のPointer Eventsだけで実装している(SVG・状態管理ライブラリ不使用)。
// 「フリーで描く」用のFreeDrawCanvas.jsxと全く同じ考え方で、なぞっている間は
// Reactの状態更新を行わずCanvas 2Dへ直接描き足すことで、実機での取りこぼしを防ぐ
// (詳しい理由はFreeDrawCanvas.jsxのコメントを参照)。
const LINE_WIDTH = 10

function readColors() {
  return {
    silhouette: cssVar('--color-silhouette', '#ded1c0'),
    primary: cssVar('--color-primary', '#c39a82'),
  }
}

function drawSilhouette(ctx, colors) {
  ctx.save()
  ctx.translate(BODY_OFFSET.x, BODY_OFFSET.y)
  ctx.fillStyle = colors.silhouette
  ctx.fill(getBodyClipPath())
  ctx.restore()
}

function drawStrokeSegment(ctx, pts, colors) {
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

export default function BodyPaintSilhouette({ strokes, onChange }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const colorsRef = useRef(null)
  const strokesRef = useRef(strokes)
  const drawingRef = useRef(false)
  const currentStrokeRef = useRef([])

  strokesRef.current = strokes

  // 人型の外側(頭の上・体の周り全体)にも自由に塗れるよう、シルエットへのクリップは行わない
  const redrawAll = () => {
    const ctx = ctxRef.current
    if (!ctx || !colorsRef.current) return
    ctx.clearRect(0, 0, PAINT_VIEWBOX.width, PAINT_VIEWBOX.height)
    drawSilhouette(ctx, colorsRef.current)
    strokesRef.current.forEach((pts) => drawStrokeSegment(ctx, pts, colorsRef.current))
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return undefined

    const setup = () => {
      const displayWidth = wrap.clientWidth
      const displayHeight = displayWidth * (PAINT_VIEWBOX.height / PAINT_VIEWBOX.width)
      const dpr = window.devicePixelRatio || 1
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`
      canvas.width = Math.round(displayWidth * dpr)
      canvas.height = Math.round(displayHeight * dpr)
      const ctx = canvas.getContext('2d')
      const cssScale = displayWidth / PAINT_VIEWBOX.width
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
    const x = ((e.clientX - rect.left) / rect.width) * PAINT_VIEWBOX.width
    const y = ((e.clientY - rect.top) / rect.height) * PAINT_VIEWBOX.height
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

    const ctx = ctxRef.current
    redrawAll()

    const p = pointFromEvent(e)
    currentStrokeRef.current = [p]
    drawStrokeSegment(ctx, currentStrokeRef.current, colorsRef.current)
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
    <div ref={wrapRef} className="body-paint-wrap">
      <canvas
        ref={canvasRef}
        className="body-paint-canvas"
        role="img"
        aria-label="体のシルエット。指でなぞると色を塗れます"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        onPointerCancel={finishStroke}
      />
    </div>
  )
}
