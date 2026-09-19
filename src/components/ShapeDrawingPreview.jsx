import { DRAW_VIEWBOX, strokeToPathD } from '../freeDraw.js'

// 統合表示・選び直し画面などで使う、自由に描いた線画の非インタラクティブな表示
export default function ShapeDrawingPreview({ strokes }) {
  return (
    <svg
      viewBox={`0 0 ${DRAW_VIEWBOX.width} ${DRAW_VIEWBOX.height}`}
      className="shape-drawing-preview"
      role="img"
      aria-label="自由に描いた形の線画"
    >
      <rect x="0" y="0" width={DRAW_VIEWBOX.width} height={DRAW_VIEWBOX.height} rx="14" className="shape-drawing-bg" />
      {strokes.map((pts, i) => (
        <path key={i} d={strokeToPathD(pts)} className="free-draw-stroke" />
      ))}
    </svg>
  )
}
