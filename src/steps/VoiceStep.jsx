import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'

export default function VoiceStep({ data, onChange, onNext, onBack }) {
  const { value, skipped } = data

  const toggleSkip = () => {
    onChange(skipped ? { value: '', skipped: false } : { value: '', skipped: true })
  }

  return (
    <StepShell
      title="もしこのモヤモヤが何か言葉を発しているとしたら、何と言っていると思いますか?"
      sub="思い浮かんだままの言葉で大丈夫です。"
      onBack={onBack}
    >
      <div className="freewrite-field">
        <textarea
          value={value}
          onChange={(e) => onChange({ value: e.target.value, skipped: false })}
          placeholder="例:もう疲れた、少し休みたい……など"
        />
      </div>
      <StepNav
        skipped={skipped}
        onToggleSkip={toggleSkip}
        canProceed={Boolean(value.trim()) || skipped}
        onNext={onNext}
      />
    </StepShell>
  )
}
