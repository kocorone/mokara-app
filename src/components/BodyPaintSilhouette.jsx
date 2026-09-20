import { useEffect, useRef } from 'react'
import { PAINT_VIEWBOX, getBodyClipPathAtOffset, fillSilhouette, paintStrokeRun } from './bodyShapeDef.js'
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
    accent: cssVar('--color-accent', '#93a98d'),
    surface: cssVar('--color-surface', '#ffffff'),
    border: cssVar('--color-border', '#e4dcd0'),
  }
}

// 「フリーで描く」用キャンバス(FreeDrawCanvas.jsx)と同じ見た目のカード状の枠を描き、
// キャンバス領域がどこからどこまでかをはっきりさせる
function drawBackground(ctx, colors) {
  const r = 14
  const w = PAINT_VIEWBOX.width
  const h = PAINT_VIEWBOX.height
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

// 人型の内側/外側で塗る色を分けつつ、境目が体の輪郭そのものできっぱり切り替わるように
// 1本分の塗り跡を描画する。先に外側の色をクリップなしで塗り、次にシルエットで
// 内側ぶんを覆い隠し、最後に内側だけにクリップした色を上から重ねる
// (点の間を補間した線ではなく輪郭の形自体で切り取るため、なぞった軌跡の粗さに
// 関わらずくっきりした境目になる)。
function drawStrokeSegment(ctx, pts, colors) {
  if (!pts || pts.length === 0) return
  ctx.lineWidth = LINE_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  paintStrokeRun(ctx, pts, colors.accent)
  ctx.save()
  ctx.clip(getBodyClipPathAtOffset())
  paintStrokeRun(ctx, pts, colors.primary)
  ctx.restore()
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
    drawBackground(ctx, colorsRef.current)
    fillSilhouette(ctx, colorsRef.current)
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
    drawStrokeSegment(ctx, [prev, next], colorsRef.current)
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
