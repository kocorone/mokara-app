// :root で定義したCSSカスタムプロパティの値を、Canvas描画などJS側で使うための共通ヘルパー
export function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)
  return v && v.trim() ? v.trim() : fallback
}
