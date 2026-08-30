import { SHAPE_OPTIONS, OtherShapeIcon, QuestionIcon } from './ShapeIcons.jsx'
import { SHAPE_OTHER_VALUE, SKIP_LABEL } from '../constants.js'
import { textOf, multiTextOf, shapeValueLabel } from '../answerFormat.js'

function shapeIconFor(value) {
  if (value === SHAPE_OTHER_VALUE) return OtherShapeIcon
  return SHAPE_OPTIONS.find((s) => s.value === value)?.Icon ?? null
}

// 形は、選択画面と同じイラスト + 言葉のラベルを横並びで表示する(背景なし)
export function ShapeFieldValue({ entry }) {
  if (entry.skipped || entry.value.length === 0) {
    return <span className="summary-row-value">{SKIP_LABEL}</span>
  }
  return (
    <div className="summary-icon-row">
      {entry.value.map((v) => {
        const Icon = shapeIconFor(v) ?? QuestionIcon
        return (
          <span className="summary-icon-item" key={v}>
            <span className="summary-icon-chip">
              <Icon />
            </span>
            <span className="summary-icon-caption">{shapeValueLabel(v)}</span>
          </span>
        )
      })}
    </div>
  )
}

// 色は、選択画面と同じスウォッチで表示する
export function ColorFieldValue({ entry }) {
  if (entry.skipped || entry.value.length === 0) {
    return <span className="summary-row-value">{SKIP_LABEL}</span>
  }
  return (
    <div className="summary-icon-row">
      {entry.value.map((c) => (
        <span key={c} className="summary-color-chip" style={{ background: c }} aria-label={c} />
      ))}
    </div>
  )
}

export function textFieldValue(key, answers) {
  switch (key) {
    case 'hardness':
      return multiTextOf(answers.hardness)
    case 'size':
      return textOf(answers.size)
    case 'bodyPart':
      return multiTextOf(answers.bodyPart)
    case 'word':
      return multiTextOf(answers.word)
    case 'voice':
      return textOf(answers.voice)
    default:
      return null
  }
}

export function noteOf(key, answers) {
  const entry = answers[key]
  return entry && typeof entry === 'object' ? entry.note : null
}
