import { useId } from 'react'
import { BODY_PATH_D, PAINT_VIEWBOX, BODY_OFFSET, HEAD_CIRCLE, strokeToPathD } from './bodyShapeDef.js'

// 統合表示・選び直し画面などで使う、塗った跡つき人型シルエットの非インタラクティブな表示。
// (人型の周りの余白にはみ出して塗った跡もそのまま表示し、内側/外側で塗った跡の色を変える)
//
// 内側/外側の境目が体の輪郭そのものできっぱり切り替わるよう、なぞった跡は
// ①外側の色でそのまま描く → ②不透明なシルエットで内側ぶんを覆い隠す →
// ③内側だけにclip-pathで切り取った色を上から重ねる、という順で描画する
// (点ごとの内外判定で線をつなぎ直すのではなく、輪郭の形自体で切り取っているため、
// なぞった軌跡の粗さに関わらずくっきりした境目になる)。
export default function BodyPartPreview({ strokes }) {
  const clipId = useId()
  return (
    <svg
      viewBox={`0 0 ${PAINT_VIEWBOX.width} ${PAINT_VIEWBOX.height}`}
      className="body-part-preview"
      role="img"
      aria-label="色を塗った体のシルエット"
    >
      <defs>
        <clipPath id={clipId}>
          <g transform={`translate(${BODY_OFFSET.x}, ${BODY_OFFSET.y})`}>
            <circle cx={HEAD_CIRCLE.cx} cy={HEAD_CIRCLE.cy} r={HEAD_CIRCLE.r} />
            <path d={BODY_PATH_D} />
          </g>
        </clipPath>
      </defs>
      <g>
        {strokes.map((pts, i) => (
          <path key={i} d={strokeToPathD(pts)} className="body-paint-stroke-outside" />
        ))}
      </g>
      <g transform={`translate(${BODY_OFFSET.x}, ${BODY_OFFSET.y})`}>
        <circle cx={HEAD_CIRCLE.cx} cy={HEAD_CIRCLE.cy} r={HEAD_CIRCLE.r} className="body-silhouette-fill" />
        <path d={BODY_PATH_D} className="body-silhouette-fill" />
      </g>
      <g clipPath={`url(#${clipId})`}>
        {strokes.map((pts, i) => (
          <path key={i} d={strokeToPathD(pts)} className="body-paint-stroke" />
        ))}
      </g>
    </svg>
  )
}
