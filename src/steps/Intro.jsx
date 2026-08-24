export default function Intro({ onStart }) {
  return (
    <div className="intro-screen">
      <div className="breathing-circle" aria-hidden="true" />
      <div className="intro-text">
        <p>まずは、ゆっくり深呼吸をしてみましょう。</p>
        <p>吸って……吐いて……。それだけで大丈夫です。</p>
        <p className="is-soft">
          今、体や心の中に、なんとなく「モヤモヤ」を感じることはありますか。
          <br />
          うまく言葉にならなくても大丈夫です。
        </p>
      </div>
      <button type="button" className="next-button" style={{ maxWidth: 260 }} onClick={onStart}>
        はじめる
      </button>
    </div>
  )
}
