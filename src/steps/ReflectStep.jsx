import StepShell from '../components/StepShell.jsx'
import AnswersOverview from '../components/AnswersOverview.jsx'

export default function ReflectStep({ answers, reflection, onReflectionChange, onNext, onBack }) {
  return (
    <StepShell
      title="このイメージを眺めてみて、浮かんできたことがあれば、言葉にしてみてください。"
      sub="書かなくても大丈夫です。思いつくままにどうぞ。"
      ambient="circle-only"
      onBack={onBack}
    >
      <AnswersOverview answers={answers} />
      <div className="freewrite-field">
        <textarea
          value={reflection}
          onChange={(e) => onReflectionChange(e.target.value)}
          placeholder="例:少しほっとした、仕事のことが気になっていたんだなぁ、など"
        />
      </div>
      <div className="step-footer">
        <button type="button" className="next-button" onClick={onNext}>
          次へ
        </button>
      </div>
    </StepShell>
  )
}
