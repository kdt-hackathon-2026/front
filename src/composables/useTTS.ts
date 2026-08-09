import { ref } from 'vue'
import { useSessionStore } from '@/stores/session'

const isSpeaking = ref(false)
const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

export interface SpeakOptions {
  onEnd?: () => void
}

/**
 * 화면 핵심 문장을 음성으로 읽어주는 공용 훅 (기능명세 8.10~8.30)
 * - 브라우저 미지원 시 isSupported=false 로 화면단에서 텍스트/버튼 대체 UI를 보여줄 수 있음
 */
export function useTTS() {
  const store = useSessionStore()

  function speak(text: string | null | undefined, { onEnd }: SpeakOptions = {}) {
    if (!text) return
    if (!store.settings.voiceGuideEnabled) return
    if (!isSupported) {
      onEnd?.()
      return
    }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ko-KR'
    utter.rate = store.settings.speechRate || 0.8
    utter.volume = store.settings.voiceVolume ?? 1
    utter.onstart = () => {
      isSpeaking.value = true
    }
    utter.onend = () => {
      isSpeaking.value = false
      onEnd?.()
    }
    utter.onerror = () => {
      isSpeaking.value = false
      onEnd?.()
    }
    window.speechSynthesis.speak(utter)
  }

  function pause() {
    if (isSupported) window.speechSynthesis.pause()
  }

  function resume() {
    if (isSupported) window.speechSynthesis.resume()
  }

  function stop() {
    if (isSupported) window.speechSynthesis.cancel()
    isSpeaking.value = false
  }

  return { speak, pause, resume, stop, isSpeaking, isSupported }
}
