import { BODY_PATH_D, PAINT_VIEWBOX, BODY_OFFSET, HEAD_CIRCLE, strokeToPathD } from './bodyShapeDef.js'

// 統合表示・選び直し画面などで使う、塗った跡つき人型シルエットの非インタラクティブな表示
// (人型の周りの余白にはみ出して塗った跡もそのまま表示する)
export default function BodyPartPreview({ strokes }) {
  return (
    <svg
      viewBox={`0 0 ${PAINT_VIEWBOX.width} ${PAINT_VIEWBOX.height}`}
      className="body-part-preview"
      role="img"
      aria-label="色を塗った体のシルエット"
    >
      <g transform={`translate(${BODY_OFFSET.x}, ${BODY_OFFSET.y})`}>
        <circle cx={HEAD_CIRCLE.cx} cy={HEAD_CIRCLE.cy} r={HEAD_CIRCLE.r} className="body-silhouette-fill" />
        <path d={BODY_PATH_D} className="body-silhouette-fill" />
      </g>
      <g>
        {strokes.map((pts, i) => (
          <path key={i} d={strokeToPathD(pts)} className="body-paint-stroke" />
        ))}
      </g>
    </svg>
  )
}
