// アプリ名の表示ブロック。導入画面(hero)・各画面上部の常設ヘッダー(compact)の両方で
// 同じフォント・「たゆたね」の強調・周りの装飾を使い回すための共通コンポーネント。
export default function AppTitle({ variant = 'compact' }) {
  const isHero = variant === 'hero'
  return (
    <div className={`app-title-block app-title-block--${variant}`}>
      {isHero && <div className="app-title-glow" aria-hidden="true" />}
      <div className="app-title-decor" aria-hidden="true">
        <span className="app-title-line" />
      </div>
      <h1 className="app-title-heading">
        <span className="app-title-bracket">『</span>
        <span className="app-title-main">たゆたね</span>
        <span className="app-title-bracket">』</span>
      </h1>
      <p className="app-title-sub">〜体の声を聴くアプリ〜</p>
    </div>
  )
}
