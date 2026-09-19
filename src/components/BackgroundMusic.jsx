import { useEffect, useRef, useState } from 'react'

// 曲が終わってから次のループ再生までの、少しの間(ミリ秒)
const LOOP_GAP_MS = 2500
const VOLUME = 0.22

function SpeakerOnIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

function SpeakerOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </svg>
  )
}

export default function BackgroundMusic() {
  const audioRef = useRef(null)
  const gapTimerRef = useRef(null)
  const playingRef = useRef(true)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = VOLUME
    audio.play().catch(() => {
      // 自動再生がブロックされた場合は、最初のタップ/クリックで再生を開始する
    })

    // ブラウザの自動再生制限を、ページ内の最初の操作で解除する
    const unlock = () => {
      if (playingRef.current && audio.paused) {
        audio.play().catch(() => {})
      }
    }
    document.addEventListener('pointerdown', unlock)
    document.addEventListener('keydown', unlock)

    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
      if (gapTimerRef.current) clearTimeout(gapTimerRef.current)
    }
  }, [])

  const handleEnded = () => {
    gapTimerRef.current = setTimeout(() => {
      const audio = audioRef.current
      if (!audio) return
      audio.currentTime = 0
      if (playingRef.current) audio.play().catch(() => {})
    }, LOOP_GAP_MS)
  }

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    const next = !playingRef.current
    playingRef.current = next
    setPlaying(next)
    if (next) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
      if (gapTimerRef.current) {
        clearTimeout(gapTimerRef.current)
        gapTimerRef.current = null
      }
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/アイリッシュの風.mp3" onEnded={handleEnded} preload="auto" />
      <button
        type="button"
        className="music-toggle-button"
        onClick={toggle}
        aria-label={playing ? '音楽を止める' : '音楽を鳴らす'}
        aria-pressed={playing}
      >
        {playing ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
      </button>
    </>
  )
}
