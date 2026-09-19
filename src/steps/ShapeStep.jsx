import { useState } from 'react'
import StepShell from '../components/StepShell.jsx'
import StepNav from '../components/StepNav.jsx'
import NoteField from '../components/NoteField.jsx'
import FreeDrawCanvas from '../components/FreeDrawCanvas.jsx'
import { SHAPE_OPTIONS, OtherShapeIcon, QuestionIcon, FreeDrawIcon } from '../components/ShapeIcons.jsx'
import { SKIP_LABEL, SHAPE_OTHER_VALUE } from '../constants.js'
import { toggleSingleValue, toggleMultiSkip } from '../answerUtils.js'

export default function ShapeStep({ data, onChange, onNext, onBack }) {
  const { value, skipped, note, drawing = [] } = data
  const [mode, setMode] = useState(drawing.length > 0 ? 'draw' : 'pick')

  // 他の形・「わからない・パス」を選び直したときは、「フリーで描く」の内容を解除する
  const toggle = (v) => onChange({ ...toggleSingleValue(data, v), drawing: [] })
  const toggleSkip = () => onChange({ ...toggleMultiSkip(data), drawing: [] })

  const setStrokes = (next) => onChange({ ...data, drawing: next, skipped: false })
  const undo = () => setStrokes(drawing.slice(0, -1))
  const clear = () => setStrokes([])
  const clearDrawing = () => onChange({ ...data, drawing: [] })

  const handleFreeDrawCardClick = () => {
    if (drawing.length > 0) {
      clearDrawing()
    } else {
      setMode('draw')
    }
  }

  const handleDrawNext = () => {
    if (drawing.length === 0) {
      onChange({ ...data, value: [], drawing: [], skipped: true })
    } else {
      onChange({ ...data, value: [], skipped: false })
    }
    onNext()
  }

  if (mode === 'draw') {
    return (
      <StepShell
        title="そのモヤモヤの形を、自由に描いてみてください。"
        sub="指でなぞって(またはドラッグして)、思うままに線を描いてみましょう。"
        ambient="circle-only"
        onBack={() => setMode('pick')}
      >
        <FreeDrawCanvas strokes={drawing} onChange={setStrokes} />
        <div className="paint-tools-row">
          <button type="button" className="paint-tool-button" onClick={undo} disabled={drawing.length === 0}>
            ひとつ戻す
          </button>
          <button type="button" className="paint-tool-button" onClick={clear} disabled={drawing.length === 0}>
            全部消す
          </button>
        </div>
        <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
        <StepNav canProceed onNext={handleDrawNext} />
      </StepShell>
    )
  }

  return (
    <StepShell title="そのモヤモヤは、どんな形をしていますか?" sub="1つ選んでください。" ambient="circle-only" onBack={onBack}>
      <div className="option-grid">
        {SHAPE_OPTIONS.map(({ value: v, label, Icon }) => (
          <button
            key={v}
            type="button"
            className={`option-card${value.includes(v) ? ' is-selected' : ''}`}
            onClick={() => toggle(v)}
          >
            <Icon />
            <span className="option-card-label">{label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`option-card${value.includes(SHAPE_OTHER_VALUE) ? ' is-selected' : ''}`}
          onClick={() => toggle(SHAPE_OTHER_VALUE)}
        >
          <OtherShapeIcon />
          <span className="option-card-label">その他の形</span>
        </button>
        <button
          type="button"
          className={`option-card${drawing.length > 0 ? ' is-selected' : ''}`}
          onClick={handleFreeDrawCardClick}
        >
          <FreeDrawIcon />
          <span className="option-card-label">フリーで描く</span>
        </button>
        <button
          type="button"
          className={`option-card${skipped ? ' is-selected' : ''}`}
          onClick={toggleSkip}
        >
          <QuestionIcon />
          <span className="option-card-label">{SKIP_LABEL}</span>
        </button>
      </div>
      <NoteField value={note} onChange={(v) => onChange({ ...data, note: v })} />
      <StepNav canProceed={value.length > 0 || skipped || drawing.length > 0} onNext={onNext} />
    </StepShell>
  )
}
