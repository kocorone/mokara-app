import { SHAPE_OPTIONS } from './components/ShapeIcons.jsx'
import { SKIP_LABEL } from './constants.js'

function shapeLabel(entry) {
  if (entry.skipped) return SKIP_LABEL
  const found = SHAPE_OPTIONS.find((s) => s.value === entry.value)
  return found ? found.label : SKIP_LABEL
}

function textOf(entry) {
  if (entry.skipped) return SKIP_LABEL
  return entry.value || SKIP_LABEL
}

export function buildExportText(answers, reflection) {
  const { shape, hardness, size, bodyPart, color, word, voice } = answers
  const lines = []
  lines.push('モヤモヤ可視化 記録')
  lines.push(`日付: ${new Date().toLocaleDateString('ja-JP')}`)
  lines.push('')
  lines.push(`形: ${shapeLabel(shape)}`)
  if (shape.note) lines.push(`  メモ: ${shape.note}`)
  lines.push(`色: ${color.skipped ? SKIP_LABEL : color.value || SKIP_LABEL}`)
  if (color.note) lines.push(`  メモ: ${color.note}`)
  lines.push(`硬さ・柔らかさ: ${textOf(hardness)}`)
  if (hardness.note) lines.push(`  メモ: ${hardness.note}`)
  lines.push(`大きさ: ${textOf(size)}`)
  if (size.note) lines.push(`  メモ: ${size.note}`)
  lines.push(`体の部位: ${textOf(bodyPart)}`)
  if (bodyPart.note) lines.push(`  メモ: ${bodyPart.note}`)
  lines.push(`言葉: ${textOf(word)}`)
  if (word.note) lines.push(`  メモ: ${word.note}`)
  lines.push(`それは何を言っているか: ${textOf(voice)}`)
  lines.push('')
  lines.push('眺めてみて、浮かんできたこと・感じたこと:')
  lines.push(reflection || '')
  lines.push('')
  lines.push('※ この記録はブラウザ内にのみ保存され、外部へは送信されていません。')
  return lines.join('\n')
}
