import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },

  // ---- 시작·회원·온보딩 ----
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

  // ---- AI 튜터 (홈 보조 진입) ----
  {
    path: '/ai-tutor',
    name: 'ai-tutor',
    component: () => import('@/views/AiTutorView.vue')
  },

  // ---- 계좌이체 함께 해보기 (AI 튜터 동반 튜토리얼) ----
  {
    path: '/together',
    name: 'together-intro',
    component: () => import('@/views/together/TogetherIntroView.vue')
  },
  {
    path: '/together/step/:n(\\d+)',
    name: 'together-step',
    component: () => import('@/views/together/TogetherStepView.vue'),
    props: (route) => ({ stepNumber: Number(route.params.n) })
  },
  {
    path: '/together/complete',
    name: 'together-complete',
    component: () => import('@/views/together/TogetherCompleteView.vue')
  },

  // ---- 계좌이체 스스로 해보기 ----
  {
    path: '/practice',
    name: 'practice-intro',
    component: () => import('@/views/practice/PracticeIntroView.vue')
  },
  {
    path: '/practice/step/:n(\\d+)',
    name: 'practice-step',
    component: () => import('@/views/practice/PracticeStepView.vue'),
    props: (route) => ({ stepNumber: Number(route.params.n) })
  },
  {
    path: '/practice/complete',
    name: 'practice-complete',
    component: () => import('@/views/practice/PracticeCompleteView.vue')
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
