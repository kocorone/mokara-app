import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'

export default function PillChoiceStep({ title, sub, options, data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const select = (v) => onChange({ value: v, skipped: false, note })

  const toggleSkip = () => {
    onChange(skipped ? { value: null, skipped: false, note } : { value: null, skipped: true, note })
  }

  return (
    <StepShell title={title} sub={sub} onBack={onBack}>
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
      </div>
      <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
      <StepNav
        skipped={skipped}
        onToggleSkip={toggleSkip}
        canProceed={Boolean(value) || skipped}
        onNext={onNext}
      />
    </StepShell>
  )
}
