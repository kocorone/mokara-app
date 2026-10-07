import { useEffect, useRef, useState } from 'react'
import { isMobileDevice, getStoredSoundPref, setStoredSoundPref } from '../soundPref.js'
import SoundPermissionPrompt from './SoundPermissionPrompt.jsx'

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

  // スマホかどうか・保存済みの「音あり/音なし」の選択は、初回レンダー時に一度だけ判定する
  const mobileRef = useRef(isMobileDevice())
  const storedPrefRef = useRef(getStoredSoundPref())
  // スマホ初回アクセス(まだ選んでいない)の場合だけ、最初にポップアップを出す
  const [needsPrompt, setNeedsPrompt] = useState(mobileRef.current && storedPrefRef.current === null)

  // 初期の再生状態: ポップアップ待ちの間は鳴らさない。スマホで選択済みならその通り。
  // パソコンは今まで通り、常に鳴らす前提で始める(自動再生がブロックされれば後述のunlockで解除)。
  const initialPlaying = needsPrompt ? false : mobileRef.current ? storedPrefRef.current === 'on' : true
  const playingRef = useRef(initialPlaying)
  const [playing, setPlaying] = useState(initialPlaying)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = VOLUME
    if (playingRef.current) {
      audio.play().catch(() => {
        // 自動再生がブロックされた場合は、最初のタップ/クリックで再生を開始する
      })
    }

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

  const applyPlaying = (next) => {
    const audio = audioRef.current
    playingRef.current = next
    setPlaying(next)
    if (!audio) return
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

  // ポップアップで「音あり/音なし」を選んだ時: 選択を端末に記憶し、次回から聞かない
  const handleChoosePref = (wantsSound) => {
    setStoredSoundPref(wantsSound ? 'on' : 'off')
    setNeedsPrompt(false)
    // ボタンのクリック(ユーザー操作)の流れの中でそのまま再生を開始することで、
    // スマホの自動再生制限に引っかからず鳴らせる
    applyPlaying(wantsSound)
  }

  // 画面隅のボタン: あとからいつでも切り替えられる。スマホでは選び直した内容も記憶し直す。
  const toggle = () => {
    const next = !playingRef.current
    applyPlaying(next)
    if (mobileRef.current) setStoredSoundPref(next ? 'on' : 'off')
  }

  return (
    <>
      <audio ref={audioRef} src="/アイリッシュの風.mp3" onEnded={handleEnded} preload="auto" />
      {needsPrompt && <SoundPermissionPrompt onChoose={handleChoosePref} />}
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
