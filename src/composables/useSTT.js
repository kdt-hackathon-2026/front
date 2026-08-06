import { ref } from 'vue'

const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export function useSTT() {
  const isListening = ref(false)
  const transcript = ref('')
  const isSupported = !!SpeechRecognitionImpl
  let recognizer = null

  function start({ onResult, onError } = {}) {
    if (!isSupported) {
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
