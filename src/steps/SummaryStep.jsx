import StepShell from '../components/StepShell.jsx'
import { iconForShape } from '../components/ShapeIcons.jsx'
import { SKIP_LABEL } from '../constants.js'

function TextRow({ label, entry }) {
  const text = entry.skipped ? SKIP_LABEL : entry.value
  return (
    <div className="summary-row">
      <span className="summary-row-label">{label}</span>
      <span className="summary-row-value">{text}</span>
      {entry.note && <div className="summary-row-note">メモ: {entry.note}</div>}
    </div>
  )
}

export default function SummaryStep({ answers, onNext, onBack }) {
  const { shape, hardness, size, bodyPart, color, word, voice } = answers
  const ShapeIcon = shape.value ? iconForShape(shape.value) : null

  return (
    <StepShell
      title="選んだものを、並べてみました。"
      sub="眺めてみて、どんなイメージが浮かんでくるか、少し感じてみてください。"
      onBack={onBack}
    >
      <div className="summary-card">
        <div className="summary-visual-row">
          <div className="summary-shape-icon">
            {ShapeIcon ? <ShapeIcon /> : <span className="summary-row-value">{SKIP_LABEL}</span>}
          </div>
          {color.value ? (
            <div className="summary-color-swatch" style={{ background: color.value }} />
          ) : (
            <span className="summary-row-value">{SKIP_LABEL}</span>
          )}
        </div>

        <div className="summary-list">
          {shape.note && (
            <div className="summary-row">
              <span className="summary-row-label">形についてのメモ</span>
              <div className="summary-row-note">{shape.note}</div>
            </div>
          )}
          {color.note && (
            <div className="summary-row">
              <span className="summary-row-label">色についてのメモ</span>
              <div className="summary-row-note">{color.note}</div>
            </div>
          )}
          <TextRow label="硬さ・柔らかさ" entry={hardness} />
          <TextRow label="大きさ" entry={size} />
          <TextRow label="体の部位" entry={bodyPart} />
          <TextRow label="言葉" entry={word} />
          <TextRow label="それは何を言っているか" entry={voice} />
        </div>
      </div>

      <p className="summary-hint">
        急がなくて大丈夫です。しばらく眺めてみてください。
      </p>

      <div className="step-footer">
        <button type="button" className="next-button" onClick={onNext}>
          次へ
        </button>
      </div>
    </StepShell>
  )
}
