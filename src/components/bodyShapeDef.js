// 案内サイン(トイレマーク・非常口サインなど)のような、シンプルな人型ピクトグラム。
// 頭は体から離れた丸。腕は肩(胴体の左右の端)から生え、先端に向けて細くなりながら
// 体からはっきり離れて伸びる。脚は腰から自然になめらかに繋がり、浅い股の窪みで分かれる。
// SVG描画(React)とCanvas描画(PNG書き出し)の両方から、同じ図形定義を参照する。
export const BODY_VIEWBOX = { width: 120, height: 172 }

// 人型の「外側」(頭の上・体の周り全体)にもペイントできるよう、
// 人型のまわりに余白を持たせた、ペイント操作用の広いキャンバス範囲。
// 人型シルエット自体はこの余白の中央(BODY_OFFSETぶんずらした位置)に描画する。
export const BODY_PAINT_MARGIN = 40
export const PAINT_VIEWBOX = {
  width: BODY_VIEWBOX.width + BODY_PAINT_MARGIN * 2,
  height: BODY_VIEWBOX.height + BODY_PAINT_MARGIN * 2,
}
export const BODY_OFFSET = { x: BODY_PAINT_MARGIN, y: BODY_PAINT_MARGIN }

// 頭(胴体とは別の、独立した丸)。頭1つぶんに対して全身が4頭身ほどになるよう、
// 頭を大きめ・胴体と脚を短めにしたバランス。
export const HEAD_CIRCLE = { cx: 60, cy: 24, r: 20 }

const CENTER_X = 60

// 胴体・腕・脚を一続きの輪郭として表す多角形の右半分(頂点 + 角の丸め半径)。
// 「人型イメージ」参考ファイルの実測比率(頭径を基準にした胴体・脚・腕の長さの比)を
// 踏まえ、胴体を脚より長め・腕は肩から腰あたりまで届く長さ・脚は腕より太めに調整。
// 肩幅は腰幅よりわずかに広く、寸胴になりすぎないようにする。
// 手・足の先は、単一の頂点ではなく2頂点による短い辺にして、丸く/平らな端にする
// (角の丸め半径は、隣り合う辺の長さより小さくなるよう調整し、先端が尖らないようにする)。
// 首は、頭の下端に少し重なる短い2頂点の縦の区間として作り、頭とほぼ同じ高さの
// 範囲に収めることで、他の頭身バランスを変えずに頭と肩のなめらかな繋がりを作る。
// 首(上)→ 首(下)→ 肩(腕の付け根)→
// 手の先(外)→ 手の先(内)→ 脇の下 → 腰 → 脚(外側)→ 足先(外)→ 足先(内)→ 脚(内側)→ 股(浅い窪み)
const RIGHT_VERTICES = [
  { x: 66, y: 41, r: 3 },
  { x: 68, y: 49, r: 4 },
  { x: 82, y: 50, r: 8 },
  { x: 101, y: 102, r: 6 },
  { x: 88, y: 111, r: 6 },
  { x: 72, y: 60, r: 6 },
  { x: 77, y: 80, r: 8 },
  { x: 79, y: 112, r: 8 },
  { x: 80, y: 148, r: 6 },
  { x: 82, y: 162, r: 5 },
  { x: 64, y: 163, r: 5 },
  { x: 64, y: 122, r: 6 },
  { x: 60, y: 108, r: 7 },
]

function mirrorVertex({ x, y, r }) {
  return { x: CENTER_X * 2 - x, y, r }
}

function buildBodyVertices() {
  const rightPart = RIGHT_VERTICES
  const leftPart = RIGHT_VERTICES.slice(0, -1)
    .reverse()
    .map(mirrorVertex)
  return [...rightPart, ...leftPart]
}

function normalize(dx, dy) {
  const len = Math.hypot(dx, dy) || 1
  return { x: dx / len, y: dy / len }
}

// 多角形の頂点列から、各角を丸めたなめらかな輪郭パスを作る
// (直線区間 + 角の二次ベジェ曲線による、案内図的にすっきりした輪郭になる)
function roundedPolygonPath(vertices) {
  const n = vertices.length
  let d = ''
  for (let i = 0; i < n; i += 1) {
    const prev = vertices[(i - 1 + n) % n]
    const curr = vertices[i]
    const next = vertices[(i + 1) % n]
    const r = curr.r
    const toPrev = normalize(prev.x - curr.x, prev.y - curr.y)
    const toNext = normalize(next.x - curr.x, next.y - curr.y)
    const p1 = { x: curr.x + toPrev.x * r, y: curr.y + toPrev.y * r }
    const p2 = { x: curr.x + toNext.x * r, y: curr.y + toNext.y * r }
    if (i === 0) {
      d += `M${p1.x.toFixed(2)},${p1.y.toFixed(2)} `
    } else {
      d += `L${p1.x.toFixed(2)},${p1.y.toFixed(2)} `
    }
    d += `Q${curr.x.toFixed(2)},${curr.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)} `
  }
  return `${d}Z`
}

export const BODY_PATH_D = roundedPolygonPath(buildBodyVertices())

// 塗った軌跡(1本分の点列)を、SVGのpath dへ変換する
export function strokeToPathD(points) {
  if (!points || !points.length) return ''
  return points.reduce((d, p, i) => `${d}${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)} `, '')
}

// 胴体パス+頭の丸を合わせた、人型シルエットの塗り範囲。
// PNG書き出し・インタラクティブな塗りキャンバスの両方から、シルエット自体の描画に使う。
export function getBodyClipPath() {
  const path = new Path2D(BODY_PATH_D)
  path.moveTo(HEAD_CIRCLE.cx + HEAD_CIRCLE.r, HEAD_CIRCLE.cy)
  path.arc(HEAD_CIRCLE.cx, HEAD_CIRCLE.cy, HEAD_CIRCLE.r, 0, Math.PI * 2)
  return path
}

// 記録画像(PNG)向け: 塗った跡つきの人型シルエットを、高さheightで(x, y)を左上として描画する
// (人型の周りの余白にはみ出して塗った跡もそのまま描画する)
export function drawBodySilhouettePreview(ctx, strokes, x, y, height, colors) {
  const scale = height / PAINT_VIEWBOX.height
  const width = PAINT_VIEWBOX.width * scale

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  ctx.save()
  ctx.translate(BODY_OFFSET.x, BODY_OFFSET.y)
  ctx.fillStyle = colors.silhouette
  ctx.fill(getBodyClipPath())
  ctx.restore()

  ctx.strokeStyle = colors.primary
  ctx.fillStyle = colors.primary
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ;(strokes || []).forEach((pts) => {
    if (!pts || pts.length === 0) return
    if (pts.length === 1 || (pts[0].x === pts[1]?.x && pts[0].y === pts[1]?.y)) {
      ctx.beginPath()
      ctx.arc(pts[0].x, pts[0].y, 5, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.stroke()
  })
  ctx.restore()

  return { width, height }
}
