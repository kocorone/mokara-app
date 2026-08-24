import { useState } from 'react'
import Intro from './steps/Intro.jsx'
import ShapeStep from './steps/ShapeStep.jsx'
import PillChoiceStep from './steps/PillChoiceStep.jsx'
import BodyPartStep from './steps/BodyPartStep.jsx'
import ColorStep from './steps/ColorStep.jsx'
import WordStep from './steps/WordStep.jsx'
import VoiceStep from './steps/VoiceStep.jsx'
import SummaryStep from './steps/SummaryStep.jsx'
import ConfirmStep from './steps/ConfirmStep.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import { HARDNESS_OPTIONS, SIZE_OPTIONS } from './constants.js'

const emptyEntry = () => ({ value: null, skipped: false, note: '' })

function initialAnswers() {
  return {
    shape: emptyEntry(),
    hardness: emptyEntry(),
    size: emptyEntry(),
    bodyPart: emptyEntry(),
    color: emptyEntry(),
    word: emptyEntry(),
    voice: { value: '', skipped: false },
    reflection: '',
  }
}

// intro(0) -> shape(1) -> hardness(2) -> size(3) -> bodyPart(4) -> color(5)
// -> word(6) -> voice(7) -> summary(8) -> confirm(9)
const QUESTION_STEPS = 7 // shape〜voice の質問数(進捗表示用)

export default function App() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(initialAnswers)

  const goNext = () => setStep((s) => s + 1)
  const goBack = () => setStep((s) => s - 1)
  const restart = () => {
    setAnswers(initialAnswers())
    setStep(0)
  }

  const patch = (key) => (value) => setAnswers((prev) => ({ ...prev, [key]: value }))

  let content = null

  if (step === 0) {
    content = <Intro onStart={goNext} />
  } else if (step === 1) {
    content = <ShapeStep data={answers.shape} onChange={patch('shape')} onNext={goNext} onBack={goBack} />
  } else if (step === 2) {
    content = (
      <PillChoiceStep
        title="今のモヤモヤは、硬いですか?柔らかいですか?"
        options={HARDNESS_OPTIONS}
        data={answers.hardness}
        onChange={patch('hardness')}
        onNext={goNext}
        onBack={goBack}
      />
    )
  } else if (step === 3) {
    content = (
      <PillChoiceStep
        title="そのモヤモヤの大きさは、どのくらいですか?"
        options={SIZE_OPTIONS}
        data={answers.size}
        onChange={patch('size')}
        onNext={goNext}
        onBack={goBack}
      />
    )
  } else if (step === 4) {
    content = <BodyPartStep data={answers.bodyPart} onChange={patch('bodyPart')} onNext={goNext} onBack={goBack} />
  } else if (step === 5) {
    content = <ColorStep data={answers.color} onChange={patch('color')} onNext={goNext} onBack={goBack} />
  } else if (step === 6) {
    content = <WordStep data={answers.word} onChange={patch('word')} onNext={goNext} onBack={goBack} />
  } else if (step === 7) {
    content = <VoiceStep data={answers.voice} onChange={patch('voice')} onNext={goNext} onBack={goBack} />
  } else if (step === 8) {
    content = <SummaryStep answers={answers} onNext={goNext} onBack={goBack} />
  } else if (step === 9) {
    content = (
      <ConfirmStep
        answers={answers}
        reflection={answers.reflection}
        onReflectionChange={patch('reflection')}
        onRestart={restart}
        onBack={goBack}
      />
    )
  }

  const showProgress = step >= 1 && step <= 7

  return (
    <div className="app-shell">
      <div className="app-inner">
        {showProgress && <ProgressBar total={QUESTION_STEPS} currentIndex={step - 1} />}
        {content}
      </div>
    </div>
  )
}
