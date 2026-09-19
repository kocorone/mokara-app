import { useEffect, useRef } from 'react'
import { BODY_VIEWBOX, getBodyClipPath } from './bodyShapeDef.js'
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
  ctx.fillStyle = colors.silhouette
  ctx.fill(getBodyClipPath())
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
  const clipActiveRef = useRef(false)

  strokesRef.current = strokes

  // 塗り跡はシルエットの外にはみ出さないよう、常にクリップ領域内で描画する
  const redrawAll = () => {
    const ctx = ctxRef.current
    if (!ctx || !colorsRef.current) return
    ctx.clearRect(0, 0, BODY_VIEWBOX.width, BODY_VIEWBOX.height)
    drawSilhouette(ctx, colorsRef.current)
    ctx.save()
    ctx.clip(getBodyClipPath())
    strokesRef.current.forEach((pts) => drawStrokeSegment(ctx, pts, colorsRef.current))
    ctx.restore()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return undefined

    const setup = () => {
      const displayWidth = wrap.clientWidth
      const displayHeight = displayWidth * (BODY_VIEWBOX.height / BODY_VIEWBOX.width)
      const dpr = window.devicePixelRatio || 1
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`
      canvas.width = Math.round(displayWidth * dpr)
      canvas.height = Math.round(displayHeight * dpr)
      const ctx = canvas.getContext('2d')
      const cssScale = displayWidth / BODY_VIEWBOX.width
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
    const x = ((e.clientX - rect.left) / rect.width) * BODY_VIEWBOX.width
    const y = ((e.clientY - rect.top) / rect.height) * BODY_VIEWBOX.height
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
    ctx.save()
    ctx.clip(getBodyClipPath())
    clipActiveRef.current = true

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
    if (clipActiveRef.current) {
      ctxRef.current.restore()
      clipActiveRef.current = false
    }
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
