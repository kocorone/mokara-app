// 前面・シンプルな線画の人型シルエット。各パーツをタップすると体の部位ラベルに変換される。
const REGIONS = [
  { id: 'head', label: '頭のあたり', el: 'circle', props: { cx: 60, cy: 26, r: 18 } },
  { id: 'neck', label: '首・喉のあたり', el: 'rect', props: { x: 52, y: 44, width: 16, height: 10, rx: 4 } },
  { id: 'shoulder-l', label: '肩のあたり', el: 'ellipse', props: { cx: 32, cy: 56, rx: 12, ry: 9 } },
  { id: 'shoulder-r', label: '肩のあたり', el: 'ellipse', props: { cx: 88, cy: 56, rx: 12, ry: 9 } },
  { id: 'chest', label: '胸のあたり', el: 'rect', props: { x: 42, y: 58, width: 36, height: 30, rx: 10 } },
  { id: 'solar', label: 'みぞおちのあたり', el: 'rect', props: { x: 42, y: 88, width: 36, height: 20, rx: 6 } },
  { id: 'belly', label: 'お腹のあたり', el: 'rect', props: { x: 40, y: 108, width: 40, height: 26, rx: 8 } },
  { id: 'waist', label: '腰のあたり', el: 'rect', props: { x: 38, y: 134, width: 44, height: 16, rx: 6 } },
  { id: 'arm-l', label: '腕のあたり', el: 'rect', props: { x: 12, y: 64, width: 14, height: 66, rx: 7 } },
  { id: 'arm-r', label: '腕のあたり', el: 'rect', props: { x: 94, y: 64, width: 14, height: 66, rx: 7 } },
  { id: 'hand-l', label: '手のあたり', el: 'circle', props: { cx: 19, cy: 133, r: 9 } },
  { id: 'hand-r', label: '手のあたり', el: 'circle', props: { cx: 101, cy: 133, r: 9 } },
  { id: 'leg-l', label: '脚のあたり', el: 'rect', props: { x: 42, y: 150, width: 16, height: 72, rx: 8 } },
  { id: 'leg-r', label: '脚のあたり', el: 'rect', props: { x: 62, y: 150, width: 16, height: 72, rx: 8 } },
  { id: 'foot-l', label: '足のあたり', el: 'ellipse', props: { cx: 50, cy: 228, rx: 11, ry: 8 } },
  { id: 'foot-r', label: '足のあたり', el: 'ellipse', props: { cx: 70, cy: 228, rx: 11, ry: 8 } },
]

export default function BodySilhouette({ value, onSelect }) {
  return (
    <svg viewBox="0 0 120 250" role="img" aria-label="体のシルエット">
      {REGIONS.map((region) => {
        const El = region.el
        const isSelected = value === region.label
        return (
          <El
            key={region.id}
            {...region.props}
            className={`body-region${isSelected ? ' is-selected' : ''}`}
            onClick={() => onSelect(region.label)}
            role="button"
            tabIndex={0}
            aria-label={region.label}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(region.label)
              }
            }}
          />
        )
      })}
    </svg>
  )
}
