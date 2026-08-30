import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import { SHAPE_OPTIONS, OtherShapeIcon, QuestionIcon } from '../components/ShapeIcons.jsx'
import { SKIP_LABEL, SHAPE_OTHER_VALUE } from '../constants.js'
import { toggleMultiValue, toggleMultiSkip } from '../answerUtils.js'

export default function ShapeStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const toggle = (v) => onChange(toggleMultiValue(data, v))
  const toggleSkip = () => onChange(toggleMultiSkip(data))

  return (
    <StepShell title="そのモヤモヤは、どんな形をしていますか?" sub="いくつ選んでも大丈夫です。" ambient="circle-only" onBack={onBack}>
      <div className="option-grid">
        {SHAPE_OPTIONS.map(({ value: v, label, Icon }) => (
          <button
            key={v}
            type="button"
            className={`option-card${value.includes(v) ? ' is-selected' : ''}`}
            onClick={() => toggle(v)}
          >
            <Icon />
            <span className="option-card-label">{label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`option-card${value.includes(SHAPE_OTHER_VALUE) ? ' is-selected' : ''}`}
          onClick={() => toggle(SHAPE_OTHER_VALUE)}
        >
          <OtherShapeIcon />
          <span className="option-card-label">その他の形</span>
        </button>
        <button
          type="button"
          className={`option-card${skipped ? ' is-selected' : ''}`}
          onClick={toggleSkip}
        >
          <QuestionIcon />
          <span className="option-card-label">{SKIP_LABEL}</span>
        </button>
      </div>
      <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
      <StepNav canProceed={value.length > 0 || skipped} onNext={onNext} />
    </StepShell>
  )
}
