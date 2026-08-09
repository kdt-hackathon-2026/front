import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { ScreenCode, StepCode } from '@/types'

// vue-router의 route.name 을 AI 튜터 API의 ScreenCode로 변환합니다.
const ROUTE_TO_SCREEN: Record<string, ScreenCode> = {
  home: 'HOME',
  settings: 'APP_SETTINGS',
  messages: 'MESSAGES',
  'onboarding-intro': 'ONBOARDING_INTRO',
  'onboarding-start': 'ONBOARDING_INTRO',
  'onboarding-accessibility': 'ONBOARDING_INTRO',
  'onboarding-bank': 'BANK_SELECTION',
  'ai-tutor': 'AI_TUTOR',
  'together-bank': 'BANK_SELECTION',
  'practice-bank': 'BANK_SELECTION',
  'together-intro': 'TRANSFER_PRACTICE',
  'practice-level': 'HELP_LEVEL',
  'together-complete': 'RESULT',
  'practice-complete': 'RESULT'
}

// 이체연습 1~5단계와 실제 StepCode의 매핑 (TransferStepView의 stepIndex 순서와 반드시 일치해야 함)
export const STEP_INDEX_TO_CODE: Record<number, StepCode> = {
  1: 'SELECT_SOURCE_ACCOUNT',
  2: 'ENTER_RECIPIENT_ACCOUNT',
  3: 'ENTER_AMOUNT',
  4: 'FINAL_REVIEW',
  5: 'AUTHENTICATION'
}

export function stepIndexForCode(stepCode: StepCode | string | null | undefined): number {
  const entry = Object.entries(STEP_INDEX_TO_CODE).find(([, code]) => code === stepCode)
  return entry ? Number(entry[0]) : 1
}

export function screenForRoute(routeName: string | null | undefined): ScreenCode {
  if (!routeName) return 'HOME'
  return ROUTE_TO_SCREEN[routeName] || 'HOME'
}

// 이체연습 단계별로 더 정확한 ScreenCode가 필요할 때 사용
export function screenForStep(stepCode: string | null | undefined): ScreenCode {
  switch (stepCode) {
    case 'SELECT_SOURCE_ACCOUNT':
      return 'SOURCE_ACCOUNT'
    case 'ENTER_RECIPIENT_ACCOUNT':
      return 'RECIPIENT_ACCOUNT'
    case 'ENTER_AMOUNT':
      return 'ENTER_AMOUNT'
    case 'FINAL_REVIEW':
      return 'FINAL_REVIEW'
    case 'AUTHENTICATION':
      return 'AUTHENTICATION'
    default:
      return 'TRANSFER_PRACTICE'
  }
}

/**
 * 현재 라우트(이체연습 1~5단계 포함)에 맞는 ScreenCode를 반환합니다.
 * together-step/practice-step은 route.name이 단계마다 바뀌지 않고 params.n만 바뀌므로,
 * 여기서 params.n까지 함께 봐야 AI 도우미가 단계별로 올바른 안내를 보여줄 수 있습니다.
 */
export function screenForCurrentRoute(route: RouteLocationNormalizedLoaded): ScreenCode {
  const name = route.name as string | undefined
  if (name === 'together-step' || name === 'practice-step') {
    const n = Number(route.params.n)
    const stepCode = STEP_INDEX_TO_CODE[n]
    return screenForStep(stepCode)
  }
  return screenForRoute(name)
}
