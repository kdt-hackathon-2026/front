import { apiClient, USE_MOCK, mockDelay } from './client'
import type {
  PracticeFeedback,
  ScreenCode,
  TutorEventRequest,
  TutorEventResult,
  TutorExplainRequest,
  TutorExplainResult,
  TutorGuide,
  TutorHintRequest,
  TutorHintResult,
  TutorNavigationRequest,
  TutorNavigationResult,
  TutorSpeechRequest,
  TutorSpeechResult,
  VoiceRecognizeResult
} from '@/types'

// 화면별 안내 콘텐츠 - 실제 서비스에서는 전부 GET /api/tutor/guides?screen=... 로 서버에서 내려줍니다.
// 여기 있는 값은 백엔드 연동 전 오버레이 도우미(TutorOverlay)를 동작시키기 위한 목데이터입니다.
const MOCK_GUIDES: Record<ScreenCode, TutorGuide> = {
  HOME: {
    guideId: 'GUIDE-HOME-001',
    screen: 'HOME',
    title: '홈 화면 안내',
    summary: '계좌이체 연습이나 AI 튜터를 선택할 수 있어요.',
    actions: [
      { order: 1, elementId: 'transfer-practice-button', instruction: '계좌이체를 연습하려면 이 버튼을 누르세요.' }
    ]
  },
  ONBOARDING_INTRO: {
    guideId: 'GUIDE-INTRO-001',
    screen: 'ONBOARDING_INTRO',
    title: '서비스 소개',
    summary: '금융한걸음이 무엇을 도와드리는지 짧게 알려드릴게요.',
    actions: [{ order: 1, elementId: 'consent-agree-checkbox', instruction: '내용을 확인하셨다면 동의에 체크해 주세요.' }]
  },
  BANK_SELECTION: {
    guideId: 'GUIDE-BANK-001',
    screen: 'BANK_SELECTION',
    title: '은행 선택 안내',
    summary: '평소 쓰시는 은행을 고르면 다음 화면부터 그 은행 화면으로 연습할 수 있어요.',
    actions: [{ order: 1, elementId: 'bank-select-list', instruction: '은행 하나를 눌러 골라주세요.' }]
  },
  TRANSFER_PRACTICE: {
    guideId: 'GUIDE-TRANSFER-001',
    screen: 'TRANSFER_PRACTICE',
    title: '이체 연습 안내',
    summary: '5단계를 순서대로 따라 하면 돼요.',
    actions: [{ order: 1, elementId: 'start-practice-button', instruction: '시작 버튼을 눌러 연습을 시작해요.' }]
  },
  HELP_LEVEL: {
    guideId: 'GUIDE-LEVEL-001',
    screen: 'HELP_LEVEL',
    title: '도움 난이도 선택',
    summary: '얼마나 도와드릴지 골라주세요.',
    actions: [
      { order: 1, elementId: 'help-level-list', instruction: '세 가지 중에서 편한 걸 하나 골라주세요.' },
      { order: 2, elementId: 'start-practice-button', instruction: '다 고르셨으면 실습 시작 버튼을 눌러주세요.' }
    ]
  },
  SOURCE_ACCOUNT: {
    guideId: 'GUIDE-SOURCE-001',
    screen: 'SOURCE_ACCOUNT',
    title: '출금 계좌 선택',
    summary: '문제에 나온 통장과 같은 계좌를 골라주세요.',
    actions: [{ order: 1, elementId: 'source-account-list', instruction: '카드를 눌러 출금 계좌를 골라주세요.' }]
  },
  RECIPIENT_ACCOUNT: {
    guideId: 'GUIDE-RECIPIENT-001',
    screen: 'RECIPIENT_ACCOUNT',
    title: '받는 분 계좌 입력',
    summary: '앞서 고른 은행으로, 받는 분의 연습용 계좌번호를 입력하는 화면입니다.',
    actions: [
      { order: 1, elementId: 'recipient-account-keypad', instruction: '숫자 키패드로 계좌번호를 천천히 눌러주세요.' },
      { order: 2, elementId: 'recipient-confirm-button', instruction: '다 입력했으면 계좌번호 확인 버튼을 눌러주세요.' }
    ]
  },
  ENTER_AMOUNT: {
    guideId: 'GUIDE-AMOUNT-001',
    screen: 'ENTER_AMOUNT',
    title: '금액 입력',
    summary: '보낼 금액을 숫자로 입력해요. 빠른 금액 버튼을 써도 좋아요.',
    actions: [{ order: 1, elementId: 'amount-keypad', instruction: '금액을 입력하거나 빠른 버튼을 눌러주세요.' }]
  },
  FINAL_REVIEW: {
    guideId: 'GUIDE-REVIEW-001',
    screen: 'FINAL_REVIEW',
    title: '최종 확인',
    summary: '받는 분, 계좌, 금액을 마지막으로 확인해요.',
    actions: [{ order: 1, elementId: 'review-checklist', instruction: '세 가지를 하나씩 확인해 주세요.' }]
  },
  AUTHENTICATION: {
    guideId: 'GUIDE-AUTH-001',
    screen: 'AUTHENTICATION',
    title: '모의 인증',
    summary: '실제 비밀번호가 아닌 교육용 인증번호 123456을 입력해요.',
    actions: [{ order: 1, elementId: 'auth-code-input', instruction: '화면에 적힌 교육용 인증번호를 입력해 주세요.' }]
  },
  RESULT: {
    guideId: 'GUIDE-RESULT-001',
    screen: 'RESULT',
    title: '연습 완료',
    summary: '수고하셨어요! 결과를 확인하고 다시 연습할 수 있어요.',
    actions: [{ order: 1, elementId: 'retry-button', instruction: '같은 연습을 다시 하려면 이 버튼을 누르세요.' }]
  },
  AI_TUTOR: {
    guideId: 'GUIDE-TUTOR-001',
    screen: 'AI_TUTOR',
    title: 'AI 튜터',
    summary: '궁금한 것을 말이나 글로 물어보세요.',
    actions: [{ order: 1, elementId: 'ask-bar-input', instruction: '여기에 궁금한 것을 입력해 주세요.' }]
  }
}

// GET /api/tutor/guides
export async function fetchTutorGuide(screen: ScreenCode, locale = 'ko-KR'): Promise<TutorGuide> {
  if (USE_MOCK) {
    await mockDelay(150)
    return MOCK_GUIDES[screen] || MOCK_GUIDES.HOME
  }
  return apiClient.get('/tutor/guides', { params: { screen, locale } }) as unknown as Promise<TutorGuide>
}

// POST /api/tutor/navigation
export async function requestTutorNavigation(body: TutorNavigationRequest): Promise<TutorNavigationResult> {
  if (USE_MOCK) {
    await mockDelay(300)
    return {
      intent: 'START_TRANSFER_PRACTICE',
      targetScreen: 'BANK_SELECTION',
      path: ['HOME', 'TRANSFER_PRACTICE', 'BANK_SELECTION'],
      highlightElementId: 'transfer-practice-button',
      spokenGuide: '계좌이체 연습 버튼을 누른 뒤 은행을 선택해 주세요.'
    }
  }
  return apiClient.post('/tutor/navigation', body) as unknown as Promise<TutorNavigationResult>
}

// POST /api/tutor/screens/explain
export async function explainScreen(body: TutorExplainRequest): Promise<TutorExplainResult> {
  if (USE_MOCK) {
    await mockDelay(250)
    const guide = MOCK_GUIDES[body.currentScreen] || MOCK_GUIDES.HOME
    return {
      purpose: guide.summary,
      essentialInfo: ['실제 계좌번호나 비밀번호를 입력하지 마세요.', '가상 연습이라 실제 돈은 이용하지 않아요.'],
      nextAction: guide.actions[0]?.instruction || '다음 버튼을 눌러 진행하세요.',
      highlightElementId: guide.actions[0]?.elementId || ''
    }
  }
  return apiClient.post('/tutor/screens/explain', body) as unknown as Promise<TutorExplainResult>
}

// POST /api/tutor/speech
export async function generateSpeech(body: TutorSpeechRequest): Promise<TutorSpeechResult> {
  if (USE_MOCK) {
    await mockDelay(200)
    return { audioUrl: '', durationMs: body.text.length * 90, speechRate: body.speechRate }
  }
  return apiClient.post('/tutor/speech', body) as unknown as Promise<TutorSpeechResult>
}

// POST /api/tutor/voice/recognize (multipart/form-data)
export async function recognizeVoice(file: Blob, locale = 'ko-KR'): Promise<VoiceRecognizeResult> {
  if (USE_MOCK) {
    await mockDelay(400)
    return { transcript: '', intent: 'UNKNOWN', confidence: 0, fallbackRequired: true }
  }
  const form = new FormData()
  form.append('file', file)
  form.append('locale', locale)
  return apiClient.post('/tutor/voice/recognize', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }) as unknown as Promise<VoiceRecognizeResult>
}

// POST /api/tutor/events
export async function recordTutorEvent(body: TutorEventRequest): Promise<TutorEventResult> {
  if (USE_MOCK) {
    await mockDelay(100)
    return { eventId: Date.now(), assistanceLevel: 'SIMPLE_HINT', sensitiveDataStored: false }
  }
  return apiClient.post('/tutor/events', body) as unknown as Promise<TutorEventResult>
}

// POST /api/tutor/hints
export async function requestHint(body: TutorHintRequest): Promise<TutorHintResult> {
  if (USE_MOCK) {
    await mockDelay(200)
    return {
      hintLevel: body.recentErrorCount > 1 ? 'FULL_GUIDE' : 'HIGHLIGHT',
      message: '문제 카드에 적힌 계좌번호를 숫자 키패드로 입력해 주세요.',
      highlightElementId: 'recipient-account-keypad'
    }
  }
  return apiClient.post('/tutor/hints', body) as unknown as Promise<TutorHintResult>
}

// GET /api/practices/{practiceId}/feedback
export async function fetchPracticeFeedback(practiceId: number): Promise<PracticeFeedback> {
  if (USE_MOCK) {
    await mockDelay(250)
    return {
      practiceId,
      overallScore: 82,
      strengths: ['받는 분 정보를 정확히 확인했어요.'],
      difficultSteps: [{ stepCode: 'ENTER_AMOUNT', reason: '입력 수정 2회', timeSpentSeconds: 48 }],
      recommendedSteps: ['ENTER_AMOUNT', 'FINAL_REVIEW']
    }
  }
  return apiClient.get(`/practices/${practiceId}/feedback`) as unknown as Promise<PracticeFeedback>
}
