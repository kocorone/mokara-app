import { useState } from 'react'
import StepShell from '../components/StepShell.jsx'
import { buildExportText } from '../exportText.js'

export default function ConfirmStep({ answers, reflection, onReflectionChange, onRestart, onBack }) {
  const [phase, setPhase] = useState('question') // 'question' | 'reflect' | 'done'

  const handleDownload = () => {
    const text = buildExportText(answers, reflection)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `mokara-${stamp}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  if (phase === 'done') {
    return (
      <div className="done-screen">
        <div className="breathing-circle" aria-hidden="true" style={{ width: 100, height: 100 }} />
        <h1 className="step-title">書き出してくれて、ありがとうございます。</h1>
        <p>
          ここまでの内容は、あなたのブラウザの中だけに残ります。
          <br />
          どこにも送信されません。
        </p>
        <button type="button" className="next-button" style={{ maxWidth: 280 }} onClick={handleDownload}>
          テキストファイルとして保存する
        </button>
        <button type="button" className="secondary-button" style={{ maxWidth: 280 }} onClick={onRestart}>
          また今度、はじめから
        </button>
      </div>
    )
  }

  if (phase === 'reflect') {
    return (
      <StepShell
        title="このイメージを眺めてみて、浮かんでくること、感じることを書いてみてください。"
        sub="うまくまとまらなくても大丈夫です。思いつくままにどうぞ。"
        onBack={() => setPhase('question')}
      >
        <div className="freewrite-field">
          <textarea
            value={reflection}
            onChange={(e) => onReflectionChange(e.target.value)}
            placeholder="今、感じていることを書いてみてください"
          />
        </div>
        <div className="step-footer">
          <button
            type="button"
            className="next-button"
            disabled={!reflection.trim()}
            onClick={() => setPhase('done')}
          >
            書き終えた
          </button>
        </div>
      </StepShell>
    )
  }

  return (
    <StepShell title="このイメージ、しっくりきますか?" onBack={onBack}>
      <div className="confirm-choice-row">
        <button type="button" className="choice-pill" onClick={() => setPhase('reflect')}>
          はい
        </button>
        <button type="button" className="choice-pill" onClick={onRestart}>
          いいえ
        </button>
      </div>
      <p className="summary-hint">
        「いいえ」を選ぶと、最初のステップからやり直せます。
      </p>
    </StepShell>
  )
}
