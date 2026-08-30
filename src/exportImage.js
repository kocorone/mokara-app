// 記録を、統合表示画面(AnswersOverview)と同じ見た目のままPNG画像として書き出す。
import { SKIP_LABEL } from './constants.js'
import { textOf, multiTextOf, shapeValueLabel } from './answerFormat.js'

const FONT_STACK = '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Sans", "Yu Gothic", sans-serif'
const CANVAS_WIDTH = 900
const SCALE = 2
const PAGE_MARGIN = 44
const CARD_PADDING_X = 40
const CARD_PADDING_Y = 44

function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)
  return v && v.trim() ? v.trim() : fallback
}

async function ensureFontsReady() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await Promise.all([
      document.fonts.load('500 26px "Zen Maru Gothic"'),
      document.fonts.load('400 22px "Zen Maru Gothic"'),
    ])
    await document.fonts.ready
  } catch {
    // フォントの取得に失敗しても、標準フォントで書き出しを続ける
  }
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapLines(ctx, text, maxWidth) {
  const paragraphs = String(text ?? '').split('\n')
  const lines = []
  paragraphs.forEach((para) => {
    if (para === '') {
      lines.push('')
      return
    }
    let line = ''
    for (const ch of Array.from(para)) {
      const test = line + ch
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line)
        line = ch
      } else {
        line = test
      }
    }
    lines.push(line)
  })
  return lines
}

// アプリ本体(ShapeIcons.jsx)と全く同じ、64x64の座標系で定義されたパスをそのまま流用して描く。
// 「その他の形」は OtherShapeIcon と同じ、点線の丸 + 十字。
const IRREGULAR_PATH =
  'M22 12c6-4 14-2 17 3 4 1 12 3 12 11 0 5-4 6-3 11 1 6-4 11-11 11-4 0-5 3-10 3-8 0-14-6-14-13 0-4 3-5 2-9-2-7 1-13 7-17z'
const CREATURE_BODY_PATH = 'M18 54c0-11 6-18 14-18s14 7 14 18'
const OTHER_CROSS_PATH = 'M32 23v18M23 32h18'

// cx, cy を中心に、元アイコンと同じ64x64の座標系を size ピクセル四方へ写像して描画する
function drawShapeGlyph(ctx, shapeValue, cx, cy, size, color) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(size / 64, size / 64)
  ctx.translate(-32, -32)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (shapeValue) {
    case 'circle':
      ctx.beginPath()
      ctx.arc(32, 32, 24, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 'oval':
      ctx.beginPath()
      ctx.ellipse(32, 32, 26, 17, 0, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 'square':
      roundRectPath(ctx, 10, 10, 44, 44, 8)
      ctx.stroke()
      break
    case 'irregular':
      ctx.stroke(new Path2D(IRREGULAR_PATH))
      break
    case 'creature':
      ctx.beginPath()
      ctx.arc(32, 20, 10, 0, Math.PI * 2)
      ctx.stroke()
      ctx.stroke(new Path2D(CREATURE_BODY_PATH))
      ctx.beginPath()
      ctx.arc(28, 18, 1.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(36, 18, 1.2, 0, Math.PI * 2)
      ctx.fill()
      break
    default:
      // その他の形
      ctx.save()
      ctx.setLineDash([7, 7])
      ctx.beginPath()
      ctx.arc(32, 32, 24, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      ctx.stroke(new Path2D(OTHER_CROSS_PATH))
  }
  ctx.restore()
}

// 「形」: イラスト(アイコン、背景なし)+ 言葉のラベルを右隣に、選んだ数だけ横に並べる
const SHAPE_CAPTION_MAX_WIDTH = 130
const SHAPE_CAPTION_LINE_HEIGHT = 22

function measureShapeRow(mctx, entry, itemSize) {
  if (entry.skipped || entry.value.length === 0) return { kind: 'text', height: 30, items: [] }
  mctx.font = `400 16px ${FONT_STACK}`
  const items = entry.value.map((v) => {
    const lines = wrapLines(mctx, shapeValueLabel(v), SHAPE_CAPTION_MAX_WIDTH)
    const textWidth = lines.reduce((max, line) => Math.max(max, mctx.measureText(line).width), 0)
    return { value: v, lines, textWidth }
  })
  const maxLines = items.reduce((max, item) => Math.max(max, item.lines.length), 1)
  const height = Math.max(itemSize, maxLines * SHAPE_CAPTION_LINE_HEIGHT + 8)
  return { kind: 'shape', height, items }
}

function drawShapeRow(ctx, meta, x, y, itemSize, colors) {
  if (meta.kind !== 'shape') {
    ctx.textAlign = 'left'
    ctx.fillStyle = colors.text
    ctx.font = `500 22px ${FONT_STACK}`
    ctx.fillText(SKIP_LABEL, x, y + 20)
    return
  }
  const rowCy = y + meta.height / 2
  let cx = x
  meta.items.forEach((item) => {
    drawShapeGlyph(ctx, item.value, cx + itemSize / 2, rowCy, itemSize, colors.primary)

    const textX = cx + itemSize + 12
    ctx.textAlign = 'left'
    ctx.fillStyle = colors.textSoft
    ctx.font = `400 16px ${FONT_STACK}`
    const textBlockHeight = item.lines.length * SHAPE_CAPTION_LINE_HEIGHT
    const firstBaselineY = rowCy - textBlockHeight / 2 + 16
    item.lines.forEach((line, li) => {
      ctx.fillText(line, textX, firstBaselineY + li * SHAPE_CAPTION_LINE_HEIGHT)
    })
    cx += itemSize + 12 + item.textWidth + 28
  })
}

// 「色」: 選択画面・統合表示画面と同じ、選んだ色そのままのスウォッチを並べる
function drawColorRow(ctx, entry, x, y, r, colors) {
  if (entry.skipped || entry.value.length === 0) {
    ctx.textAlign = 'left'
    ctx.fillStyle = colors.text
    ctx.font = `500 22px ${FONT_STACK}`
    ctx.fillText(SKIP_LABEL, x, y + r * 0.7)
    return
  }
  let cx = x + r
  entry.value.forEach((hex) => {
    ctx.save()
    ctx.shadowColor = 'rgba(120, 105, 80, 0.18)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 3
    ctx.beginPath()
    ctx.arc(cx, y + r, r, 0, Math.PI * 2)
    ctx.fillStyle = hex
    ctx.fill()
    ctx.restore()
    ctx.lineWidth = 2
    ctx.strokeStyle = colors.surface
    ctx.stroke()
    cx += r * 2 + 12
  })
}

function buildRecordImageBlob(answers) {
  return new Promise((resolve, reject) => {
    const { shape, hardness, size, bodyPart, color, word, voice, reflection } = answers

    const colors = {
      bg: cssVar('--color-bg', '#f7f3ee'),
      surface: cssVar('--color-surface', '#ffffff'),
      surfaceSoft: cssVar('--color-surface-soft', '#f1ece3'),
      border: cssVar('--color-border', '#e4dcd0'),
      text: cssVar('--color-text', '#4a463f'),
      textSoft: cssVar('--color-text-soft', '#8a8578'),
      textFaint: cssVar('--color-text-faint', '#b3ac9e'),
      primary: cssVar('--color-primary', '#c39a82'),
    }

    const now = new Date()
    const dateStr = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

    // 統合表示画面(AnswersOverview)と同じ並び順 + 自由記述を最後に追加
    const textRows = [
      { key: 'hardness', label: '触り心地', value: multiTextOf(hardness), note: hardness.note },
      { key: 'size', label: '大きさ', value: textOf(size), note: size.note },
      { key: 'bodyPart', label: '体の部位', value: multiTextOf(bodyPart), note: bodyPart.note },
      { key: 'word', label: '気持ち', value: multiTextOf(word), note: word.note },
      { key: 'voice', label: 'モヤモヤからの言葉', value: textOf(voice), note: null },
      {
        key: 'reflection',
        label: '眺めてみて浮かんできたこと',
        value: reflection && reflection.trim() ? reflection : '(記入なし)',
        note: null,
      },
    ]

    const cardWidth = CANVAS_WIDTH - PAGE_MARGIN * 2
    const contentWidth = cardWidth - CARD_PADDING_X * 2

    // ---- 折り返し計算(オフスクリーン測定) ----
    const measureCanvas = document.createElement('canvas')
    const mctx = measureCanvas.getContext('2d')

    mctx.font = `500 22px ${FONT_STACK}`
    const textRowLines = textRows.map((row) => wrapLines(mctx, row.value, contentWidth))

    // メモは「メモ: 」を付けたうえで折り返す(測定・描画の両方でこの行を共有する)
    const noteLinesOf = (note) => {
      if (!note) return []
      mctx.font = `400 16px ${FONT_STACK}`
      return wrapLines(mctx, `メモ: ${note}`, contentWidth - 24)
    }
    const textRowNoteLines = textRows.map((row) => noteLinesOf(row.note))
    const shapeNoteLines = noteLinesOf(shape.note)
    const colorNoteLines = noteLinesOf(color.note)

    const shapeItemSize = 62
    const shapeRowMeta = measureShapeRow(mctx, shape, shapeItemSize)

    const headerMessage =
      '今日のモヤモヤを大切に感じた記録です。ちゃんと自分とつながりながら感じることができたことを、よかったら時々思い出してください。'
    const headerMessageLineHeight = 22
    mctx.font = `400 15px ${FONT_STACK}`
    const headerMessageLines = wrapLines(mctx, headerMessage, cardWidth)

    // ---- 縦位置の積み上げ(カード内部) ----
    const rowGap = 26
    const labelHeight = 24
    const lineHeight = 30
    const noteLineHeight = 22
    // メモ欄1つぶんの高さ(内側パディング16 + 描画後の余白8)。測定と実描画で必ず同じ値を使う。
    const noteBlockHeight = (lineCount) => lineCount * noteLineHeight + 24

    let innerHeight = 0

    // 形
    innerHeight += labelHeight
    innerHeight += shapeRowMeta.height
    if (shapeNoteLines.length) {
      innerHeight += noteBlockHeight(shapeNoteLines.length)
    }
    innerHeight += rowGap

    // 色
    innerHeight += labelHeight
    innerHeight += color.skipped || !color.value.length ? 30 : 64
    if (colorNoteLines.length) {
      innerHeight += noteBlockHeight(colorNoteLines.length)
    }
    innerHeight += rowGap

    // テキスト系の項目(触り心地・大きさ・体の部位・気持ち・モヤモヤからの言葉・自由記述)
    textRows.forEach((row, i) => {
      innerHeight += labelHeight
      innerHeight += textRowLines[i].length * lineHeight
      if (textRowNoteLines[i].length) {
        innerHeight += noteBlockHeight(textRowNoteLines[i].length)
      }
      if (i < textRows.length - 1) innerHeight += rowGap
    })

    const cardHeight = CARD_PADDING_Y * 2 + innerHeight

    // ---- ページ全体の高さ ----
    const headerHeight = 70
    const headerMessageHeight = headerMessageLines.length * headerMessageLineHeight + 20
    const footerHeight = 70
    const height =
      PAGE_MARGIN + headerHeight + headerMessageHeight + cardHeight + 30 + footerHeight + PAGE_MARGIN * 0.5

    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_WIDTH * SCALE
    canvas.height = height * SCALE
    const ctx = canvas.getContext('2d')
    ctx.scale(SCALE, SCALE)

    // 背景(アプリと同じ、落ち着いたクリーム色)
    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, CANVAS_WIDTH, height)

    // ヘッダー: タイトル(左) / 日付時刻(右)
    let y = PAGE_MARGIN
    ctx.textAlign = 'left'
    ctx.fillStyle = colors.text
    ctx.font = `500 26px ${FONT_STACK}`
    ctx.fillText('今日のモヤモヤの記録', PAGE_MARGIN, y + 26)

    ctx.textAlign = 'right'
    ctx.fillStyle = colors.textFaint
    ctx.font = `400 15px ${FONT_STACK}`
    ctx.fillText(dateStr, CANVAS_WIDTH - PAGE_MARGIN, y + 18)
    ctx.fillText(timeStr, CANVAS_WIDTH - PAGE_MARGIN, y + 38)

    y += headerHeight

    // タイトル下の一言メッセージ
    ctx.textAlign = 'left'
    ctx.fillStyle = colors.textSoft
    ctx.font = `400 15px ${FONT_STACK}`
    headerMessageLines.forEach((line, i) => {
      ctx.fillText(line, PAGE_MARGIN, y + 16 + i * headerMessageLineHeight)
    })
    y += headerMessageHeight

    // カード(統合表示画面と同じ、白い角丸カード)
    const cardX = PAGE_MARGIN
    const cardY = y
    ctx.save()
    ctx.shadowColor = 'rgba(120, 105, 80, 0.14)'
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 8
    roundRectPath(ctx, cardX, cardY, cardWidth, cardHeight, 26)
    ctx.fillStyle = colors.surface
    ctx.fill()
    ctx.restore()

    let rowY = cardY + CARD_PADDING_Y
    const rowX = cardX + CARD_PADDING_X

    const drawLabel = (text) => {
      ctx.textAlign = 'left'
      ctx.fillStyle = colors.textFaint
      ctx.font = `400 15px ${FONT_STACK}`
      ctx.fillText(text, rowX, rowY + 12)
      rowY += labelHeight
    }

    const drawNote = (lines) => {
      if (!lines.length) return
      const boxTop = rowY + 6
      const boxHeight = lines.length * noteLineHeight + 16
      roundRectPath(ctx, rowX, boxTop, contentWidth, boxHeight, 10)
      ctx.fillStyle = colors.surfaceSoft
      ctx.fill()
      ctx.textAlign = 'left'
      ctx.fillStyle = colors.textSoft
      ctx.font = `400 16px ${FONT_STACK}`
      // テキストの行ブロックを、枠の上下中央に配置する(上下の余白が均等になる位置に先頭行のベースラインを置く)
      const firstBaseline = boxTop + 8 + 16
      lines.forEach((line, li) => {
        ctx.fillText(line, rowX + 12, firstBaseline + li * noteLineHeight)
      })
      rowY += noteBlockHeight(lines.length)
    }

    // 形
    drawLabel('形')
    drawShapeRow(ctx, shapeRowMeta, rowX, rowY, shapeItemSize, colors)
    rowY += shapeRowMeta.height
    drawNote(shapeNoteLines)
    rowY += rowGap

    // 色
    drawLabel('色')
    if (color.skipped || !color.value.length) {
      ctx.textAlign = 'left'
      ctx.fillStyle = colors.text
      ctx.font = `500 22px ${FONT_STACK}`
      ctx.fillText(SKIP_LABEL, rowX, rowY + 20)
      rowY += 30
    } else {
      drawColorRow(ctx, color, rowX, rowY, 24, colors)
      rowY += 64
    }
    drawNote(colorNoteLines)
    rowY += rowGap

    // 触り心地・大きさ・体の部位・気持ち・モヤモヤからの言葉・自由記述
    textRows.forEach((row, i) => {
      drawLabel(row.label)
      ctx.textAlign = 'left'
      ctx.fillStyle = colors.text
      ctx.font = `500 22px ${FONT_STACK}`
      textRowLines[i].forEach((line) => {
        ctx.fillText(line, rowX, rowY + 18)
        rowY += lineHeight
      })
      if (textRowNoteLines[i].length) {
        drawNote(textRowNoteLines[i])
      }
      if (i < textRows.length - 1) rowY += rowGap
    })

    // フッター: やわらかい帯状の一言
    const footerText = 'この記録はあなたのブラウザの中だけで作成されました。'
    const footerY = cardY + cardHeight + 30
    ctx.font = `400 15px ${FONT_STACK}`
    const footerTextWidth = ctx.measureText(footerText).width
    const bandW = Math.min(cardWidth, footerTextWidth + 64)
    roundRectPath(ctx, (CANVAS_WIDTH - bandW) / 2, footerY, bandW, 44, 22)
    ctx.fillStyle = colors.surfaceSoft
    ctx.fill()
    ctx.fillStyle = colors.textSoft
    ctx.textAlign = 'center'
    ctx.fillText(footerText, CANVAS_WIDTH / 2, footerY + 27)

    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('画像の書き出しに失敗しました'))
    }, 'image/png')
  })
}

export async function downloadRecordImage(answers) {
  await ensureFontsReady()
  const blob = await buildRecordImageBlob(answers)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const now = new Date()
  const pad2 = (n) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}-${pad2(now.getHours())}${pad2(now.getMinutes())}`
  a.href = url
  a.download = `mokara-record-${stamp}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
