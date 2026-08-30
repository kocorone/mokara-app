export default function StepNav({ canProceed, onNext, label = '次へ' }) {
  return (
    <div className="step-footer">
      <button type="button" className="next-button" disabled={!canProceed} onClick={onNext}>
        {label}
      </button>
    </div>
  )
}
