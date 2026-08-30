import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import { WORD_OPTIONS, WORD_OTHER, SKIP_LABEL } from '../constants.js'
import { toggleMultiValue, toggleMultiSkip } from '../answerUtils.js'

export default function WordStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note } = data

  const handleClick = (w) => {
    if (w === SKIP_LABEL) onChange(toggleMultiSkip(data))
    else onChange(toggleMultiValue(data, w))
  }

  return (
    <StepShell
      title="そのモヤモヤを「気持ちの言葉」で表現するとしたら、どれが近いですか?"
      sub="近いものを選んでみてください。いくつ選んでも大丈夫です。"
      ambient="circle-only"
      onBack={onBack}
    >
      <div className="word-grid">
        {WORD_OPTIONS.map((w) => (
          <button
            key={w}
            type="button"
            className={`word-chip${value.includes(w) ? ' is-selected' : ''}`}
            onClick={() => handleClick(w)}
          >
            {w}
          </button>
        ))}
        <button
          type="button"
          className={`word-chip${value.includes(WORD_OTHER) ? ' is-selected' : ''}`}
          onClick={() => handleClick(WORD_OTHER)}
        >
          {WORD_OTHER}
        </button>
        <button
          type="button"
          className={`word-chip${skipped ? ' is-selected' : ''}`}
          onClick={() => handleClick(SKIP_LABEL)}
        >
          {SKIP_LABEL}
        </button>
      </div>
      <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
      <StepNav canProceed={value.length > 0 || skipped} onNext={onNext} />
    </StepShell>
  )
}
