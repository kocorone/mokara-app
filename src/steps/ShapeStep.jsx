import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import { SHAPE_OPTIONS } from '../components/ShapeIcons.jsx'

export default function ShapeStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const selectShape = (v) => {
    onChange({ value: v, skipped: false, note })
  }

  const toggleSkip = () => {
    if (skipped) {
      onChange({ value: null, skipped: false, note })
    } else {
      onChange({ value: null, skipped: true, note })
    }
  }

  return (
    <StepShell title="今のモヤモヤは、どんな形をしていますか?" onBack={onBack}>
      <div className="option-grid">
        {SHAPE_OPTIONS.map(({ value: v, label, Icon }) => (
          <button
            key={v}
            type="button"
            className={`option-card${value === v ? ' is-selected' : ''}`}
            onClick={() => selectShape(v)}
          >
            <Icon />
            <span className="option-card-label">{label}</span>
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
