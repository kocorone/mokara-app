// シンプルな線画アイコン(固定・AI生成ではない)
const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function CircleIcon(props) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <circle cx="32" cy="32" r="24" {...strokeProps} />
    </svg>
  )
}

export function OvalIcon(props) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <ellipse cx="32" cy="32" rx="26" ry="17" {...strokeProps} />
    </svg>
  )
}

export function SquareIcon(props) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <rect x="10" y="10" width="44" height="44" rx="8" {...strokeProps} />
    </svg>
  )
}

export function IrregularIcon(props) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <path
        d="M22 12c6-4 14-2 17 3 4 1 12 3 12 11 0 5-4 6-3 11 1 6-4 11-11 11-4 0-5 3-10 3-8 0-14-6-14-13 0-4 3-5 2-9-2-7 1-13 7-17z"
        {...strokeProps}
      />
    </svg>
  )
}

export function CreatureIcon(props) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <circle cx="32" cy="20" r="10" {...strokeProps} />
      <path d="M18 54c0-11 6-18 14-18s14 7 14 18" {...strokeProps} />
      <circle cx="28" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="36" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const SHAPE_OPTIONS = [
  { value: 'circle', label: '丸', Icon: CircleIcon },
  { value: 'oval', label: '楕円', Icon: OvalIcon },
  { value: 'square', label: '四角', Icon: SquareIcon },
  { value: 'irregular', label: '不定形(もやもやした形)', Icon: IrregularIcon },
  { value: 'creature', label: '人や動物・キャラクターなど', Icon: CreatureIcon },
]

export function iconForShape(value) {
  return SHAPE_OPTIONS.find((s) => s.value === value)?.Icon ?? null
}
