// 複数選択(配列 + わからない・パス)の共通トグルロジック

export function toggleMultiValue(entry, v) {
  const exists = entry.value.includes(v)
  const nextValue = exists ? entry.value.filter((x) => x !== v) : [...entry.value, v]
  return { ...entry, value: nextValue, skipped: false }
}

export function toggleMultiSkip(entry) {
  return entry.skipped ? { ...entry, value: [], skipped: false } : { ...entry, value: [], skipped: true }
}
