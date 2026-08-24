export default function StepNav({ skipped, onToggleSkip, canProceed, onNext, showSkip = true }) {
  return (
    <div className="step-footer">
      {showSkip && (
        <div className="skip-row">
          <button
            type="button"
            className={`skip-button${skipped ? ' is-selected' : ''}`}
            onClick={onToggleSkip}
          >
            {skipped ? '「わからない・パス」を選んでいます' : 'わからない・パス'}
          </button>
        </div>
      )}
      <button type="button" className="next-button" disabled={!canProceed} onClick={onNext}>
        次へ
      </button>
    </div>
  )
}
