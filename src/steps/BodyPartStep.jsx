import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import BodySilhouette from '../components/BodySilhouette.jsx'
import { SKIP_LABEL } from '../constants.js'
import { toggleMultiValue, toggleMultiSkip } from '../answerUtils.js'

export default function BodyPartStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const toggle = (label) => onChange(toggleMultiValue(data, label))
  const toggleSkip = () => onChange(toggleMultiSkip(data))

  const displayLabel = skipped ? SKIP_LABEL : value.length ? value.join('・') : ' '

  return (
    <StepShell
      title="そのモヤモヤは、体のどのあたりにありますか?"
      sub="人型の図をタップして、近いところを教えてください。いくつ選んでも大丈夫です。"
      ambient="circle-only"
      onBack={onBack}
    >
      <div className="silhouette-wrap">
        <BodySilhouette value={value} skipped={skipped} onToggle={toggle} onSkip={toggleSkip} />
        <div className="body-region-label">{displayLabel}</div>
      </div>
      <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
      <StepNav canProceed={value.length > 0 || skipped} onNext={onNext} />
    </StepShell>
  )
}
