import { useState } from 'react'
import { downloadRecordImage } from '../exportImage.js'
import { BackArrow } from '../components/StepShell.jsx'
import AnswersOverview from '../components/AnswersOverview.jsx'

export default function DoneStep({ answers, onRestart, onBack }) {
  const [imageBusy, setImageBusy] = useState(false)

  const handleImageDownload = async () => {
    if (imageBusy) return
    setImageBusy(true)
    try {
      await downloadRecordImage(answers)
    } catch {
      // 書き出しに失敗しても画面はそのまま(ブラウザ内で完結する処理のため)
    } finally {
      setImageBusy(false)
    }
  }

  return (
    <div className="done-screen">
      {onBack && (
        <div className="done-header">
          <button type="button" className="back-button" onClick={onBack} aria-label="前の画面に戻る">
            <BackArrow />
          </button>
        </div>
      )}
      <div className="breathing-circle" aria-hidden="true" style={{ width: 100, height: 100 }} />
      <h1 className="step-title">
        あなたのモヤモヤを一緒に感じさせてくれて
        <br />
        ありがとうございました。
        <br />
        あなたが自分とつながりながら今日を過ごせますように。
      </h1>
      <div className="done-summary-wrap">
        <AnswersOverview answers={answers} showReflection />
      </div>

      <p>
        ここまでの内容は、あなたのブラウザの中だけに残ります。
        <br />
        どこにも送信されません。
      </p>

      <button
        type="button"
        className="next-button"
        style={{ maxWidth: 280 }}
        onClick={handleImageDownload}
        disabled={imageBusy}
      >
        {imageBusy ? '画像を作成しています…' : '記録を画像として保存する'}
      </button>

      <button type="button" className="secondary-button" style={{ maxWidth: 280 }} onClick={onRestart}>
        はじめに戻る
      </button>
    </div>
  )
}
