import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import { WORD_OPTIONS } from '../constants.js'

export default function WordStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const select = (v) => onChange({ value: v, skipped: false, note })

  const toggleSkip = () => {
    onChange(skipped ? { value: null, skipped: false, note } : { value: null, skipped: true, note })
  }

  return (
    <StepShell title="今の気持ちに近い言葉はありますか?" sub="近いものを、ひとつ選んでみてください。" onBack={onBack}>
      <div className="word-grid">
        {WORD_OPTIONS.map((w) => (
          <button
            key={w}
            type="button"
            className={`word-chip${value === w ? ' is-selected' : ''}`}
            onClick={() => select(w)}
          >
            {w}
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
