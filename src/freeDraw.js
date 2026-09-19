// 「形」ステップの「フリーで描く」機能で使う、共通の座標定義と描画ヘルパー。
// SVG描画(React)とCanvas描画(PNG書き出し)の両方から参照する。
export const DRAW_VIEWBOX = { width: 280, height: 200 }

// 描いた軌跡(1本分の点列)を、SVGのpath dへ変換する
export function strokeToPathD(points) {
  if (!points || !points.length) return ''
  return points.reduce((d, p, i) => `${d}${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)} `, '')
}

// 記録画像(PNG)向け: 描いた線画を、指定した幅で(x, y)を左上として描画する
export function drawFreeDrawingPreview(ctx, strokes, x, y, width, colors) {
  const scale = width / DRAW_VIEWBOX.width
  const height = DRAW_VIEWBOX.height * scale

  ctx.save()
  ctx.translate(x, y)

  const r = 14
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.arcTo(width, 0, width, height, r)
  ctx.arcTo(width, height, 0, height, r)
  ctx.arcTo(0, height, 0, 0, r)
  ctx.arcTo(0, 0, width, 0, r)
  ctx.closePath()
  ctx.fillStyle = colors.surfaceSoft
  ctx.fill()

  ctx.save()
  ctx.scale(scale, scale)
  ctx.strokeStyle = colors.primary
  ctx.fillStyle = colors.primary
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ;(strokes || []).forEach((pts) => {
    if (!pts || pts.length === 0) return
    if (pts.length === 1) {
      ctx.beginPath()
      ctx.arc(pts[0].x, pts[0].y, 3, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.stroke()
  })
  ctx.restore()
  ctx.restore()

  return { width, height }
}
