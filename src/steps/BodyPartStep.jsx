import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import BodyPaintSilhouette from '../components/BodyPaintSilhouette.jsx'
import { SKIP_LABEL } from '../constants.js'
import { toggleMultiSkip } from '../answerUtils.js'

export default function BodyPartStep({ data, onChange, onNext, onBack }) {
  const { value: strokes, skipped, note } = data

  const setStrokes = (next) => onChange({ ...data, value: next, skipped: false })
  const toggleSkip = () => onChange(toggleMultiSkip(data))
  const undo = () => setStrokes(strokes.slice(0, -1))
  const clear = () => setStrokes([])

  return (
    <StepShell
      title="そのモヤモヤは、体のどのあたりにありますか?"
      sub="人型の図を指でなぞって(またはドラッグして)、感じるところに色をつけてみてください。"
      ambient="circle-only"
      onBack={onBack}
    >
      <div className="silhouette-wrap">
        {skipped ? (
          <div className="body-region-label">{SKIP_LABEL}</div>
        ) : (
          <>
            <BodyPaintSilhouette strokes={strokes} onChange={setStrokes} />
            <div className="paint-tools-row">
              <button type="button" className="paint-tool-button" onClick={undo} disabled={strokes.length === 0}>
                ひとつ戻す
              </button>
              <button type="button" className="paint-tool-button" onClick={clear} disabled={strokes.length === 0}>
                全部消す
              </button>
            </div>
          </>
        )}
        <button
          type="button"
          className={`skip-toggle-button${skipped ? ' is-selected' : ''}`}
          onClick={toggleSkip}
        >
          {SKIP_LABEL}
        </button>
      </div>
      <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
      <StepNav canProceed={strokes.length > 0 || skipped} onNext={onNext} />
    </StepShell>
  )
}
