import { useId } from 'react'
import { BODY_PATH_D, PAINT_VIEWBOX, BODY_OFFSET, HEAD_CIRCLE, strokeToPathD } from './bodyShapeDef.js'

// 統合表示・選び直し画面などで使う、塗った跡つき人型シルエットの非インタラクティブな表示。
// 選択画面(BodyPaintSilhouette.jsx)で塗ったものがそのまま縮小表示されるよう、
// キャンバスの枠・人型・塗った跡を同じ座標系・同じ太さ・同じ色分けで描く
// (人型の周りの余白にはみ出して塗った跡もそのまま表示し、内側/外側で塗った跡の色を変える)。
//
// 内側/外側の境目が体の輪郭そのものできっぱり切り替わるよう、なぞった跡は
// ①外側の色でそのまま描く → ②不透明なシルエットで内側ぶんを覆い隠す →
// ③内側だけにclip-pathで切り取った色を上から重ねる、という順で描画する
// (点ごとの内外判定で線をつなぎ直すのではなく、輪郭の形自体で切り取っているため、
// なぞった軌跡の粗さに関わらずくっきりした境目になる)。
//
// なお、<clipPath>の中身は<g>でまとめずに図形を直接並べ、ずらす位置はその図形自身の
// transformで指定している。<clipPath>の子に置いた<g>はブラウザに無視され、
// 切り取り範囲が空になって(=内側に塗った跡が丸ごと消えて)しまうため。
export default function BodyPartPreview({ strokes }) {
  const clipId = useId()
  const bodyTransform = `translate(${BODY_OFFSET.x}, ${BODY_OFFSET.y})`
  return (
    <svg
      viewBox={`0 0 ${PAINT_VIEWBOX.width} ${PAINT_VIEWBOX.height}`}
      className="body-part-preview"
      role="img"
      aria-label="色を塗った体のシルエット"
    >
      <defs>
        <clipPath id={clipId}>
          <circle transform={bodyTransform} cx={HEAD_CIRCLE.cx} cy={HEAD_CIRCLE.cy} r={HEAD_CIRCLE.r} />
          <path transform={bodyTransform} d={BODY_PATH_D} />
        </clipPath>
      </defs>
      <rect
        x="0"
        y="0"
        width={PAINT_VIEWBOX.width}
        height={PAINT_VIEWBOX.height}
        rx="14"
        className="body-paint-preview-bg"
      />
      <g>
        {strokes.map((pts, i) => (
          <path key={i} d={strokeToPathD(pts)} className="body-paint-stroke-outside" />
        ))}
      </g>
      <g transform={bodyTransform}>
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
