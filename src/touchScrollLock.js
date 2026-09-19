// 指でキャンバスをなぞっている間だけ、ページ全体のスクロール・ピンチズームを止める。
//
// CSSのtouch-actionだけに頼らない理由:
// - WebKit(Safari)には、<svg>要素に対してtouch-actionが正しく効かない既知の不具合がある。
// - なぞっている指がキャンバスの外へわずかにはみ出した場合、親要素側でスクロールが
//   始まってしまうことがある。
// なぞり始め(pointerdown)からなぞり終わり(pointerup/cancel/leave)までの間だけ、
// body/html のtouch-actionを一時的にnoneにし、終わったら必ず元の値へ戻す。
let lockCount = 0
let prevBodyTouchAction = ''
let prevHtmlTouchAction = ''

export function lockPageScroll() {
  lockCount += 1
  if (lockCount > 1) return
  prevBodyTouchAction = document.body.style.touchAction
  prevHtmlTouchAction = document.documentElement.style.touchAction
  document.body.style.touchAction = 'none'
  document.documentElement.style.touchAction = 'none'
}

export function unlockPageScroll() {
  if (lockCount === 0) return
  lockCount -= 1
  if (lockCount > 0) return
  document.body.style.touchAction = prevBodyTouchAction
  document.documentElement.style.touchAction = prevHtmlTouchAction
}
