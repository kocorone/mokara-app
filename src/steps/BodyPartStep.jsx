import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import BodySilhouette from '../components/BodySilhouette.jsx'

export default function BodyPartStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const select = (label) => onChange({ value: label, skipped: false, note })

  const toggleSkip = () => {
    onChange(skipped ? { value: null, skipped: false, note } : { value: null, skipped: true, note })
  }

  return (
    <StepShell title="そのモヤモヤは、体のどのへんにありますか?" sub="人型の図をタップして、近いところを教えてください。" onBack={onBack}>
      <div className="silhouette-wrap">
        <BodySilhouette value={value} onSelect={select} />
        <div className="body-region-label">{value || ' '}</div>
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
