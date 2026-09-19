import AppTitle from '../components/AppTitle.jsx'

export default function Intro({ onStart }) {
  return (
    <div className="intro-screen">
      <AppTitle variant="hero" />
      <div className="breathing-circle" aria-hidden="true" />
      <div className="intro-text">
        <p>
          まずは、ゆっくり深呼吸をしてみましょう。
          <br />
          吸って……。吐いて……。それだけで大丈夫です。
        </p>
        <p className="is-soft">
          今、体や心の中に、なんとなく「モヤモヤ」を感じることはありますか。
          <br />
          うまく言葉にならなくても大丈夫です。
          <br />
          しばらく一緒に感じてみましょう。
        </p>
      </div>
      <button type="button" className="next-button" style={{ maxWidth: 260 }} onClick={onStart}>
        はじめる
      </button>
    </div>
  )
}
