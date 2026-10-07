// 「音あり/音なし」の選択を、スマホの端末に記憶しておくためのヘルパー。
// プライベートブラウジングなどでlocalStorageが使えない環境でもアプリが落ちないよう、
// 読み書きは必ずtry/catchで囲む。
const STORAGE_KEY = 'mokara-sound-pref'

// 「スマホで開いたとき」の判定。タブレット(iPadなど)まで含めず、
// 文字通りスマートフォンのUAだけを対象にする(ユーザーの依頼文言「スマホ」に合わせる)。
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPod|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 保存済みの選択を返す('on' | 'off' | null=まだ選んでいない)
export function getStoredSoundPref() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === 'on' || v === 'off' ? v : null
  } catch {
    return null
  }
}

export function setStoredSoundPref(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // 保存できなくても、今回の表示上の挙動には影響させない
  }
}
