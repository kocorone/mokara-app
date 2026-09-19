import { useId } from 'react'
import { BODY_PATH_D, BODY_VIEWBOX, HEAD_CIRCLE, strokeToPathD } from './bodyShapeDef.js'

// 統合表示・選び直し画面などで使う、塗った跡つき人型シルエットの非インタラクティブな表示
export default function BodyPartPreview({ strokes }) {
  const clipId = useId()
  return (
    <svg
      viewBox={`0 0 ${BODY_VIEWBOX.width} ${BODY_VIEWBOX.height}`}
      className="body-part-preview"
      role="img"
      aria-label="色を塗った体のシルエット"
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
      </g>
    </svg>
  )
}
