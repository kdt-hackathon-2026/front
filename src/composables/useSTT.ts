import { ref } from 'vue'

// Web Speech API(SpeechRecognition)는 표준 TS lib에 포함되어 있지 않고
// 브라우저마다 webkitSpeechRecognition으로 노출되는 경우가 많아 최소한의 타입만 직접 선언합니다.
interface SpeechRecognitionResultLike {
  0: { transcript: string }
}
interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
}

const SpeechRecognitionImpl: SpeechRecognitionCtor | null =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition || null : null

export interface SttStartOptions {
  onResult?: (text: string) => void
  onError?: (error: { reason: string }) => void
}

export function useSTT() {
  const isListening = ref(false)
  const transcript = ref('')
  const isSupported = !!SpeechRecognitionImpl
  let recognizer: SpeechRecognitionLike | null = null

  function start({ onResult, onError }: SttStartOptions = {}) {
    if (!isSupported || !SpeechRecognitionImpl) {
      onError?.({ reason: 'UNSUPPORTED' })
      return
    }
    recognizer = new SpeechRecognitionImpl()
    recognizer.lang = 'ko-KR'
    recognizer.interimResults = true
    recognizer.continuous = false

    recognizer.onstart = () => {
      isListening.value = true
      transcript.value = ''
    }
    recognizer.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')
      transcript.value = text
      onResult?.(text)
    }
    recognizer.onerror = (event) => {
      isListening.value = false
      onError?.({ reason: event.error })
    }
    recognizer.onend = () => {
      isListening.value = false
    }
    recognizer.start()
  }

  function stop() {
    recognizer?.stop()
    isListening.value = false
  }

  return { start, stop, isListening, transcript, isSupported }
}
