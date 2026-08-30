import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import { HARDNESS_TEXTURE_OPTIONS, SKIP_LABEL } from '../constants.js'
import { toggleMultiValue, toggleMultiSkip } from '../answerUtils.js'

export default function HardnessStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const handleClick = (opt) => {
    if (opt === SKIP_LABEL) onChange(toggleMultiSkip(data))
    else onChange(toggleMultiValue(data, opt))
  }

  return (
    <StepShell
      title="そのモヤモヤの触り心地は、どんな感じがしますか?"
      sub="いくつ選んでも大丈夫です。"
      ambient="circle-only"
      onBack={onBack}
    >
      <div className="option-grid">
        {HARDNESS_TEXTURE_OPTIONS.map((opt) => {
          const isSkip = opt === SKIP_LABEL
          const isSelected = isSkip ? skipped : value.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              className={`option-card option-card--text${isSelected ? ' is-selected' : ''}`}
              onClick={() => handleClick(opt)}
            >
              <span className="option-card-label">{opt}</span>
            </button>
          )
        })}
      </div>
      <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
      <StepNav canProceed={value.length > 0 || skipped} onNext={onNext} />
    </StepShell>
  )
}
