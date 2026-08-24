export default function ProgressBar({ total, currentIndex }) {
  return (
    <div className="progress-track" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`progress-dot${i < currentIndex ? ' is-done' : ''}${i === currentIndex ? ' is-current' : ''}`}
        />
      ))}
    </div>
  )
}
