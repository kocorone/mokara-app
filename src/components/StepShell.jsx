function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export default function StepShell({ title, sub, onBack, children }) {
  return (
    <div className="step">
      <div className="step-header">
        {onBack && (
          <button type="button" className="back-button" onClick={onBack} aria-label="前の画面に戻る">
            <BackArrow />
          </button>
        )}
        <div>
          <h1 className="step-title">{title}</h1>
          {sub && <p className="step-sub">{sub}</p>}
        </div>
      </div>
      <div className="step-content">{children}</div>
    </div>
  )
}
