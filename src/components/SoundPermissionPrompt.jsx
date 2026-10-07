// スマホで開いたときに最初に出す、「音を出しますか?」の確認ポップアップ。
// 選んだ内容はsoundPref.js側でその端末(localStorage)に記憶され、次回からは表示されない。
export default function SoundPermissionPrompt({ onChoose }) {
  return (
    <div className="sound-prompt-overlay" role="dialog" aria-modal="true" aria-label="音を出すかどうかの確認">
      <div className="sound-prompt-card">
        <p className="sound-prompt-title">音を出しますか?</p>
        <p className="sound-prompt-sub">アプリの間、静かなBGMが流れます。あとから画面の隅のボタンで切り替えられます。</p>
        <div className="sound-prompt-choice-row">
          <button type="button" className="choice-pill" onClick={() => onChoose(true)}>
            音あり
          </button>
          <button type="button" className="choice-pill" onClick={() => onChoose(false)}>
            音なし
          </button>
        </div>
      </div>
    </div>
  )
}
