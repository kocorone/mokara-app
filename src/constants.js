export const SKIP_LABEL = 'わからない・パス'

export const SIZE_OPTIONS = ['小さい', '中くらい', '大きい']

// 触り心地(旧: 硬さ・柔らかさ)。「その他」「わからない・パス」も同じ並びに含める。
export const HARDNESS_TEXTURE_OPTIONS = [
  'やわらかい',
  'かたい',
  'すべすべ',
  'ザラザラ',
  'ふわふわ',
  'ねばねば',
  'その他',
  SKIP_LABEL,
]

export const WORD_OPTIONS = [
  '悲しい',
  '寂しい',
  '疲れた',
  '焦り',
  '不安',
  '緊張',
  'モヤモヤ',
  'イライラ',
  '安心',
  '嬉しい',
]

export const WORD_OTHER = 'その他'

export const COLOR_SWATCHES = [
  '#E39898',
  '#EFB080',
  '#EAD283',
  '#A9CDA0',
  '#8FC0BA',
  '#92B6DB',
  '#ADA0D6',
  '#DDA6C7',
  '#B5AC9E',
]

// 形の選択肢のうち「その他の形」を表す値
export const SHAPE_OTHER_VALUE = 'other'

// 質問ステップの順序と、やり直し選択画面などで使う表示ラベル
export const QUESTION_FIELDS = [
  { key: 'shape', label: '形' },
  { key: 'hardness', label: '触り心地' },
  { key: 'size', label: '大きさ' },
  { key: 'bodyPart', label: '体の部位' },
  { key: 'color', label: '色' },
  { key: 'word', label: '気持ち' },
  { key: 'voice', label: 'モヤモヤからの言葉' },
]

export const QUESTION_ORDER = QUESTION_FIELDS.map((f) => f.key)
