// 複数選択(配列 + わからない・パス)の共通トグルロジック

export function toggleMultiValue(entry, v) {
  const exists = entry.value.includes(v)
  const nextValue = exists ? entry.value.filter((x) => x !== v) : [...entry.value, v]
  return { ...entry, value: nextValue, skipped: false }
}

export function toggleMultiSkip(entry) {
  return entry.skipped ? { ...entry, value: [], skipped: false } : { ...entry, value: [], skipped: true }
}

// 単一選択(配列で保持しつつ、常に0〜1件にする)の共通トグルロジック。
// 選択済みのものをもう一度選ぶと選択解除、他のものを選ぶと選び直しになる。
export function toggleSingleValue(entry, v) {
  const nextValue = entry.value.includes(v) ? [] : [v]
  return { ...entry, value: nextValue, skipped: false }
}
