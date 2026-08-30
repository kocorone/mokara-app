import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import { SKIP_LABEL } from '../constants.js'

export default function PillChoiceStep({ title, sub, options, data, onChange, onNext, onBack, ambient }) {
  const { value, skipped, note } = data

  const select = (v) => onChange({ value: v, skipped: false, note })

  const toggleSkip = () => {
    onChange(skipped ? { value: null, skipped: false, note } : { value: null, skipped: true, note })
  }

  return (
    <StepShell title={title} sub={sub} ambient={ambient} onBack={onBack}>
      <div className="choice-list">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`choice-pill${value === opt ? ' is-selected' : ''}`}
            onClick={() => select(opt)}
          >
            {opt}
          </button>
        ))}
        <button
          type="button"
          className={`choice-pill${skipped ? ' is-selected' : ''}`}
          onClick={toggleSkip}
        >
          {SKIP_LABEL}
        </button>
      </div>
      <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
      <StepNav canProceed={Boolean(value) || skipped} onNext={onNext} />
    </StepShell>
  )
}
