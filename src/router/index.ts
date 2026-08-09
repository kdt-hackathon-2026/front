import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/messages',
    name: 'messages',
    component: () => import('@/views/MessagesView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/AppSettingsView.vue')
  },
  {
    path: '/analysis',
    name: 'analysis-note',
    component: () => import('@/views/AnalysisNoteView.vue')
  },
  {
    path: '/kb-transfer',
    name: 'kb-transfer',
    component: () => import('@/views/KbDemoView.vue')
  },

  // ---- 시작·회원·온보딩 ----
  {
    path: '/onboarding/intro',
    name: 'onboarding-intro',
    component: () => import('@/views/onboarding/IntroConsentView.vue')
  },
  {
    path: '/onboarding/start',
    name: 'onboarding-start',
    component: () => import('@/views/onboarding/StartMethodView.vue')
  },
  {
    path: '/onboarding/accessibility',
    name: 'onboarding-accessibility',
    component: () => import('@/views/onboarding/AccessibilitySetupView.vue')
  },
  {
    path: '/onboarding/bank',
    name: 'onboarding-bank',
    component: () => import('@/views/onboarding/BankSelectView.vue')
  },

  // ---- AI 튜터 (자유 질문 화면) ----
  {
    path: '/ai-tutor',
    name: 'ai-tutor',
    component: () => import('@/views/AiTutorView.vue')
  },

  // ---- 계좌이체 함께 해보기 (AI 튜터 동반 · 처음 배우기) / 스스로 해보기 ----
  // 두 흐름 모두 같은 이체연습 API를 쓰므로 화면 컴포넌트를 공유하고, mode prop으로만 구분합니다.
  // 순서: 은행 선택(공용) -> [함께: 단계 안내 / 스스로: 도움 난이도 선택] -> 5단계 실습 -> 완료
  {
    path: '/together',
    name: 'together-bank',
    component: () => import('@/views/practice/TransferBankSelectView.vue'),
    props: { mode: 'together' }
  },
  {
    path: '/together/start',
    name: 'together-intro',
    component: () => import('@/views/practice/TransferIntroView.vue')
  },
  {
    path: '/together/step/:n(\\d+)',
    name: 'together-step',
    component: () => import('@/views/practice/TransferStepView.vue'),
    props: (route) => ({ mode: 'together', stepIndex: Number(route.params.n) })
  },
  {
    path: '/together/complete',
    name: 'together-complete',
    component: () => import('@/views/practice/TransferCompleteView.vue'),
    props: { mode: 'together' }
  },

  {
    path: '/practice',
    name: 'practice-bank',
    component: () => import('@/views/practice/TransferBankSelectView.vue'),
    props: { mode: 'practice' }
  },
  {
    path: '/practice/level',
    name: 'practice-level',
    component: () => import('@/views/practice/LevelSelectView.vue')
  },
  {
    path: '/practice/step/:n(\\d+)',
    name: 'practice-step',
    component: () => import('@/views/practice/TransferStepView.vue'),
    props: (route) => ({ mode: 'practice', stepIndex: Number(route.params.n) })
  },
  {
    path: '/practice/complete',
    name: 'practice-complete',
    component: () => import('@/views/practice/TransferCompleteView.vue'),
    props: { mode: 'practice' }
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
