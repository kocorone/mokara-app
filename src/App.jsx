import { useEffect, useState } from 'react'
import Intro from './steps/Intro.jsx'
import ShapeStep from './steps/ShapeStep.jsx'
import HardnessStep from './steps/HardnessStep.jsx'
import PillChoiceStep from './steps/PillChoiceStep.jsx'
import BodyPartStep from './steps/BodyPartStep.jsx'
import ColorStep from './steps/ColorStep.jsx'
import WordStep from './steps/WordStep.jsx'
import VoiceStep from './steps/VoiceStep.jsx'
import SummaryStep from './steps/SummaryStep.jsx'
import RedoPickStep from './steps/RedoPickStep.jsx'
import ReflectStep from './steps/ReflectStep.jsx'
import DoneStep from './steps/DoneStep.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import BackgroundMusic from './components/BackgroundMusic.jsx'
import AppTitle from './components/AppTitle.jsx'
import { SIZE_OPTIONS, QUESTION_ORDER } from './constants.js'

const emptyMulti = () => ({ value: [], skipped: false, note: '' })
const emptySingle = () => ({ value: null, skipped: false, note: '' })

function initialAnswers() {
  return {
    shape: { value: [], skipped: false, note: '', drawing: [] },
    hardness: emptyMulti(),
    size: emptySingle(),
    bodyPart: emptyMulti(),
    color: emptyMulti(),
    word: emptyMulti(),
    voice: { value: '', skipped: false },
    reflection: '',
  }
}

// screen: 'intro' | 'question' | 'summary' | 'redoPick' | 'reflect' | 'done'
export default function App() {
  const [screen, setScreen] = useState('intro')
  const [answers, setAnswers] = useState(initialAnswers)
  const [queue, setQueue] = useState(QUESTION_ORDER)
  const [queueIndex, setQueueIndex] = useState(0)
  const [backTarget, setBackTarget] = useState('intro') // 質問キューの先頭で「戻る」した時の行き先

  // 画面が切り替わるたびに、常にページの一番上へスクロールし直す
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen, queueIndex])

  const patch = (key) => (value) => setAnswers((prev) => ({ ...prev, [key]: value }))

  const startQuestions = () => {
    setQueue(QUESTION_ORDER)
    setQueueIndex(0)
    setBackTarget('intro')
    setScreen('question')
  }

  const goNextInQueue = () => {
    if (queueIndex + 1 < queue.length) {
      setQueueIndex((i) => i + 1)
    } else {
      setScreen('summary')
    }
  }

  const goBackInQueue = () => {
    if (queueIndex > 0) {
      setQueueIndex((i) => i - 1)
    } else {
      setScreen(backTarget)
    }
  }

  const backToLastQuestion = () => {
    setQueueIndex(queue.length - 1)
    setScreen('question')
  }

  const startRedo = (selectedKeys) => {
    if (selectedKeys.length === 0) {
      setScreen('summary')
      return
    }
    setQueue(selectedKeys)
    setQueueIndex(0)
    setBackTarget('redoPick')
    setScreen('question')
  }

  const restart = () => {
    setAnswers(initialAnswers())
    setQueue(QUESTION_ORDER)
    setQueueIndex(0)
    setBackTarget('intro')
    setScreen('intro')
  }

  const renderQuestion = () => {
    const key = queue[queueIndex]
    const shared = { onNext: goNextInQueue, onBack: goBackInQueue }
    switch (key) {
      case 'shape':
        return <ShapeStep data={answers.shape} onChange={patch('shape')} {...shared} />
      case 'hardness':
        return <HardnessStep data={answers.hardness} onChange={patch('hardness')} {...shared} />
      case 'size':
        return (
          <PillChoiceStep
            title="そのモヤモヤの大きさは、どのくらいですか?"
            options={SIZE_OPTIONS}
            data={answers.size}
            onChange={patch('size')}
            ambient="circle-only"
            {...shared}
          />
        )
      case 'bodyPart':
        return <BodyPartStep data={answers.bodyPart} onChange={patch('bodyPart')} {...shared} />
      case 'color':
        return <ColorStep data={answers.color} onChange={patch('color')} {...shared} />
      case 'word':
        return <WordStep data={answers.word} onChange={patch('word')} {...shared} />
      case 'voice':
        return <VoiceStep data={answers.voice} onChange={patch('voice')} {...shared} />
      default:
        return null
    }
  }

  let content = null

  if (screen === 'intro') {
    content = <Intro onStart={startQuestions} />
  } else if (screen === 'question') {
    content = renderQuestion()
  } else if (screen === 'summary') {
    content = (
      <SummaryStep
        answers={answers}
        onConfirmYes={() => setScreen('reflect')}
        onConfirmNo={() => setScreen('redoPick')}
        onBack={backToLastQuestion}
      />
    )
  } else if (screen === 'redoPick') {
    content = <RedoPickStep answers={answers} onSubmit={startRedo} onBack={() => setScreen('summary')} />
  } else if (screen === 'reflect') {
    content = (
      <ReflectStep
        answers={answers}
        reflection={answers.reflection}
        onReflectionChange={patch('reflection')}
        onNext={() => setScreen('done')}
        onBack={() => setScreen('summary')}
      />
    )
  } else if (screen === 'done') {
    content = <DoneStep answers={answers} onRestart={restart} onBack={() => setScreen('reflect')} />
  }

  const showProgress = screen === 'question'

  return (
    <div className="app-shell">
      <div className="app-inner">
        {screen !== 'intro' && <AppTitle variant="compact" />}
        {showProgress && <ProgressBar total={queue.length} currentIndex={queueIndex} />}
        {content}
      </div>
      <BackgroundMusic />
    </div>
  )
}
