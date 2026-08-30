import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import { COLOR_SWATCHES, SKIP_LABEL } from '../constants.js'
import { toggleMultiValue, toggleMultiSkip } from '../answerUtils.js'

export default function ColorStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const toggle = (v) => onChange(toggleMultiValue(data, v))
  const toggleSkip = () => onChange(toggleMultiSkip(data))
  const addCustom = (hex) => {
    if (value.includes(hex)) return
    onChange({ ...data, value: [...value, hex], skipped: false })
  }

  const customPicks = value.filter((v) => !COLOR_SWATCHES.includes(v))

  return (
    <StepShell
      title="そのモヤモヤは、どんな色をしていますか?"
      sub="しっくりくる色を選んでみてください。いくつ選んでも大丈夫です。"
      ambient="circle-only"
      onBack={onBack}
    >
      <div className="swatch-grid">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch${value.includes(c) ? ' is-selected' : ''}`}
            style={{ background: c }}
            aria-label={c}
            onClick={() => toggle(c)}
          />
        ))}
        <button
          type="button"
          className={`swatch swatch-skip${skipped ? ' is-selected' : ''}`}
          aria-label={SKIP_LABEL}
          onClick={toggleSkip}
        >
          ?
        </button>
      </div>
      <div className="custom-color-row">
        <input
          type="color"
          value="#c39a82"
          onChange={(e) => addCustom(e.target.value)}
          aria-label="自由に色を選ぶ"
        />
        <span>しっくりくる色がなければ、自由に選べます</span>
      </div>
      {customPicks.length > 0 && (
        <div className="custom-color-picks">
          {customPicks.map((c) => (
            <button
              key={c}
              type="button"
              className="swatch is-selected custom-color-pick"
              style={{ background: c }}
              aria-label={`${c} を選択解除`}
              onClick={() => toggle(c)}
            />
          ))}
        </div>
      )}
      <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
      <StepNav canProceed={value.length > 0 || skipped} onNext={onNext} />
    </StepShell>
  )
}
