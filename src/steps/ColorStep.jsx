import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import { COLOR_SWATCHES } from '../constants.js'

export default function ColorStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const select = (v) => onChange({ value: v, skipped: false, note })

  const toggleSkip = () => {
    onChange(skipped ? { value: null, skipped: false, note } : { value: null, skipped: true, note })
  }

  return (
    <StepShell title="そのモヤモヤに色をつけるとしたら、何色でしょうか?" sub="しっくりくる色をひとつ選んでみてください。" onBack={onBack}>
      <div className="swatch-grid">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch${value === c ? ' is-selected' : ''}`}
            style={{ background: c }}
            aria-label={c}
            onClick={() => select(c)}
          />
        ))}
      </div>
      <div className="custom-color-row">
        <input
          type="color"
          value={value && value.startsWith('#') ? value : '#c39a82'}
          onChange={(e) => select(e.target.value)}
          aria-label="自由に色を選ぶ"
        />
        <span>しっくりくる色がなければ、自由に選べます</span>
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
