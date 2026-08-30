import { QUESTION_FIELDS } from '../constants.js'
import { ShapeFieldValue, ColorFieldValue, textFieldValue, noteOf } from './FieldValue.jsx'

export default function AnswersOverview({ answers, showReflection = false }) {
  return (
    <div className="summary-card">
      <div className="summary-list">
        {QUESTION_FIELDS.map(({ key, label }) => (
          <div className="summary-row" key={key}>
            <span className="summary-row-label">{label}</span>
            {key === 'shape' && <ShapeFieldValue entry={answers.shape} />}
            {key === 'color' && <ColorFieldValue entry={answers.color} />}
            {key !== 'shape' && key !== 'color' && (
              <span className="summary-row-value">{textFieldValue(key, answers)}</span>
            )}
            {noteOf(key, answers) && <div className="summary-row-note">メモ: {noteOf(key, answers)}</div>}
          </div>
        ))}
        {showReflection && (
          <div className="summary-row">
            <span className="summary-row-label">眺めてみて浮かんできたこと</span>
            <span className="summary-row-value">
              {answers.reflection && answers.reflection.trim() ? answers.reflection : '(記入なし)'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
