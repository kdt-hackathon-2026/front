import { defineStore } from 'pinia'
import type { ScreenCode, TutorGuide } from '@/types'
import { fetchTutorGuide } from '@/api/tutorApi'

export type WalkthroughStep = 'settings' | 'messages' | 'message-detail' | 'copy' | 'message-home' | 'home-transfer' | 'done'

interface TutorOverlayState {
  isOpen: boolean
  screen: ScreenCode | null
  guide: TutorGuide | null
  actionIndex: number
  loading: boolean
  walkthroughStep: WalkthroughStep
  seenScreens: ScreenCode[] // 이번 앱 세션에서 이미 자동으로 보여준 화면 (같은 화면에서 매번 뜨지 않도록)
}

export const useTutorStore = defineStore('tutor', {
  state: (): TutorOverlayState => ({
    isOpen: false,
    screen: null,
    guide: null,
    actionIndex: 0,
    loading: false,
    walkthroughStep: 'settings',
    seenScreens: []
  }),

  getters: {
    currentAction(state) {
      return state.guide?.actions[state.actionIndex] || null
    },
    isLastAction(state) {
      if (!state.guide) return true
      return state.actionIndex >= state.guide.actions.length - 1
    }
  },

  actions: {
    setWalkthroughStep(step: WalkthroughStep) {
      this.walkthroughStep = step
    },
    async openForScreen(screen: ScreenCode, opts: { force?: boolean } = {}) {
      // 자동 진입 시에는 화면당 세션에서 한 번만 - 도우미 버튼으로 부르면 force로 항상 재생
      if (!opts.force && this.seenScreens.includes(screen)) return
      this.screen = screen
      this.guide = null
      this.actionIndex = 0
      this.loading = true
      this.isOpen = true
      try {
        this.guide = await fetchTutorGuide(screen)
      } finally {
        this.loading = false
        if (!this.seenScreens.includes(screen)) this.seenScreens.push(screen)
      }
    },
    next() {
      if (!this.guide) return
      if (this.actionIndex < this.guide.actions.length - 1) {
        this.actionIndex += 1
      } else {
        this.close()
      }
    },
    prev() {
      if (this.actionIndex > 0) this.actionIndex -= 1
    },
    close() {
      this.isOpen = false
    }
  }
})
