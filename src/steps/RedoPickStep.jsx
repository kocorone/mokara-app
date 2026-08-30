import { useState } from 'react'
import StepShell from '../components/StepShell.jsx'
import { QUESTION_FIELDS } from '../constants.js'
import { ShapeFieldValue, ColorFieldValue, textFieldValue, noteOf } from '../components/FieldValue.jsx'

// 各項目の「今選んでいる内容」を、統合表示画面と同じ見た目で見せる
function FieldPreview({ fieldKey, answers }) {
  if (fieldKey === 'shape') return <ShapeFieldValue entry={answers.shape} />
  if (fieldKey === 'color') return <ColorFieldValue entry={answers.color} />
  return <span className="summary-row-value">{textFieldValue(fieldKey, answers)}</span>
}

export default function RedoPickStep({ answers, onSubmit, onBack }) {
  const [selected, setSelected] = useState([])

  const toggle = (key) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const handleSubmit = () => {
    // 表示順を保ったまま、やり直す項目だけを取り出す
    const ordered = QUESTION_FIELDS.filter((f) => selected.includes(f.key)).map((f) => f.key)
    onSubmit(ordered)
  }

  return (
    <StepShell
      title="選び直したい項目にチェックを入れてください。"
      sub="チェックした項目を選び直すことができます。"
      ambient="circle-only"
      onBack={onBack}
    >
      <div className="redo-pick-list">
        {QUESTION_FIELDS.map(({ key, label }) => {
          const isSelected = selected.includes(key)
          return (
            <button
              key={key}
              type="button"
              className={`redo-pick-row${isSelected ? ' is-selected' : ''}`}
              onClick={() => toggle(key)}
            >
              <span className={`redo-pick-check${isSelected ? ' is-checked' : ''}`} aria-hidden="true" />
              <span className="redo-pick-body">
                <span className="summary-row-label">{label}</span>
                <FieldPreview fieldKey={key} answers={answers} />
                {noteOf(key, answers) && <div className="summary-row-note">メモ: {noteOf(key, answers)}</div>}
              </span>
            </button>
          )
        })}
      </div>
      <div className="step-footer">
        <button
          type="button"
          className="next-button"
          disabled={selected.length === 0}
          onClick={handleSubmit}
        >
          チェックした項目を選び直す
        </button>
      </div>
    </StepShell>
  )
}
