import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import { SKIP_LABEL } from '../constants.js'

export default function VoiceStep({ data, onChange, onNext, onBack }) {
  const { value, skipped } = data

  const toggleSkip = () => {
    onChange(skipped ? { value: '', skipped: false } : { value: '', skipped: true })
  }

  return (
    <StepShell
      title="このモヤモヤは、あなたに何を伝えていますか?"
      sub="思い浮かんだままの言葉で大丈夫です。"
      ambient="circle-only"
      onBack={onBack}
    >
      <div className="freewrite-field">
        <textarea
          value={value}
          onChange={(e) => onChange({ value: e.target.value, skipped: false })}
          placeholder="例:よく頑張った、つらかったね……など"
          disabled={skipped}
        />
      </div>
      <div className="choice-list">
        <button
          type="button"
          className={`choice-pill${skipped ? ' is-selected' : ''}`}
          onClick={toggleSkip}
        >
          {SKIP_LABEL}
        </button>
      </div>
      <StepNav canProceed={Boolean(value.trim()) || skipped} onNext={onNext} />
    </StepShell>
  )
}
