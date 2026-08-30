// 回答を画面表示・画像書き出し用のテキストに整形する共通ヘルパー
import { SHAPE_OPTIONS } from './components/ShapeIcons.jsx'
import { SHAPE_OTHER_VALUE, SKIP_LABEL } from './constants.js'

export function shapeValueLabel(v) {
  if (v === SHAPE_OTHER_VALUE) return 'その他の形'
  const found = SHAPE_OPTIONS.find((s) => s.value === v)
  return found ? found.label : v
}

// 単一選択の項目(大きさ・「モヤモヤの言葉」)
export function textOf(entry) {
  if (entry.skipped) return SKIP_LABEL
  return entry.value || SKIP_LABEL
}

// 複数選択の項目(形・触り心地・体の部位・色・言葉)
export function multiTextOf(entry, mapper = (v) => v) {
  if (entry.skipped) return SKIP_LABEL
  if (!entry.value || entry.value.length === 0) return SKIP_LABEL
  return entry.value.map(mapper).join('・')
}
