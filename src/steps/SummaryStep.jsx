import StepShell from '../components/StepShell.jsx'
import AnswersOverview from '../components/AnswersOverview.jsx'

export default function SummaryStep({ answers, onConfirmYes, onConfirmNo, onBack }) {
  return (
    <StepShell
      title="選んだものをしばらく眺めてみましょう。"
      ambient="circle-only"
      onBack={onBack}
    >
      <AnswersOverview answers={answers} />

      <div className="confirm-block">
        <p className="confirm-question">今あなたの中にある「モヤモヤ」にしっくりくる感じはありますか。</p>
        <div className="confirm-choice-row">
          <button type="button" className="choice-pill" onClick={onConfirmYes}>
            はい
          </button>
          <button type="button" className="choice-pill" onClick={onConfirmNo}>
            いいえ
          </button>
        </div>
        <p className="summary-hint">「いいえ」を選ぶと、しっくりこない項目について選び直すことができます。</p>
      </div>
    </StepShell>
  )
}
