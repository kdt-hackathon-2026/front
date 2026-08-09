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
      { order: 1, elementId: 'settings-tab', instruction: '처음에는 설정에서 글씨 크기와 AI 안내 단계를 먼저 맞춰볼게요. 아래 설정 버튼을 눌러주세요.' }
    ]
  },
  HOME_MESSAGES: {
    guideId: 'GUIDE-HOME-MESSAGES-001',
    screen: 'HOME_MESSAGES',
    title: '메시지 미션 확인',
    summary: '메시지에서 오늘 연습할 이체 미션을 확인해볼게요.',
    actions: [{ order: 1, elementId: 'messages-tab', instruction: '메시지 버튼을 눌러 이체 요청 내용을 확인해볼게요.' }]
  },
  HOME_TRANSFER: {
    guideId: 'GUIDE-HOME-TRANSFER-001',
    screen: 'HOME_TRANSFER',
    title: '이체 연습 시작',
    summary: '미션을 확인했으니 이제 계좌이체 연습을 시작해볼게요.',
    actions: [{ order: 1, elementId: 'transfer-practice-button', instruction: '문자에서 확인한 미션을 연습하려면 계좌이체 연습 버튼을 눌러주세요.' }]
  },
  APP_SETTINGS: {
    guideId: 'GUIDE-APP-SETTINGS-001',
    screen: 'APP_SETTINGS',
    title: '금융한걸음 앱 설정',
    summary: '나에게 편한 글씨와 AI 안내 방식을 차례로 설정해볼게요.',
    actions: [
      { order: 1, elementId: 'settings-text-size', instruction: '먼저 보기 편한 글씨 크기를 선택해보세요.' },
      { order: 2, elementId: 'settings-help-level', instruction: 'AI 안내 수준 강도를 하·중·상 중에서 골라보세요. 처음이라면 상이 좋아요.' },
      { order: 3, elementId: 'settings-voice-volume', instruction: 'AI 안내 음성 크기를 조절해보세요.' },
      { order: 4, elementId: 'settings-voice-speed', instruction: 'AI 안내 음성 속도도 편한 속도로 선택해보세요.' },
      { order: 5, elementId: 'settings-home-button', instruction: '설정이 끝났으면 홈 버튼을 눌러 처음 화면으로 돌아가볼게요.' }
    ]
  },
  MESSAGES: {
    guideId: 'GUIDE-MESSAGES-001',
    screen: 'MESSAGES',
    title: '오늘의 메시지 미션',
    summary: '문자에 도착한 이체 요청을 열어 미션을 확인해볼게요.',
    actions: [{ order: 1, elementId: 'message-card-1', instruction: '먼저 읽지 않은 메시지를 눌러 요청한 사람과 금액을 확인해보세요.' }]
  },
  MESSAGE_DETAIL: {
    guideId: 'GUIDE-MESSAGE-DETAIL-001',
    screen: 'MESSAGE_DETAIL',
    title: '문자 속 계좌번호 확인',
    summary: '문자 내용을 확인한 뒤 계좌번호를 복사해 이체 화면에 사용해볼게요.',
    actions: [{ order: 1, elementId: 'message-account-link', instruction: '파란색 밑줄 계좌번호를 누르면 복사할 수 있어요. 이체 화면에 빠르게 붙여넣기 위해 복사하는 거예요.' }]
  },
  MESSAGE_COPY: {
    guideId: 'GUIDE-MESSAGE-COPY-001',
    screen: 'MESSAGE_COPY',
    title: '계좌번호 복사',
    summary: '복사한 계좌번호를 이체 화면에 붙여넣으면 숫자를 다시 입력하지 않아도 돼요.',
    actions: [{ order: 1, elementId: 'copy-confirm-button', instruction: '계좌번호를 복사하려면 복사하기 버튼을 눌러주세요.' }]
  },
  MESSAGE_HOME: {
    guideId: 'GUIDE-MESSAGE-HOME-001',
    screen: 'MESSAGE_HOME',
    title: '홈으로 돌아가기',
    summary: '계좌번호를 복사했어요. 홈으로 돌아가 이체 연습을 시작해볼게요.',
    actions: [{ order: 1, elementId: 'message-home-button', instruction: '복사한 계좌번호를 사용하러 홈 버튼을 눌러 돌아가세요.' }]
  },
  MESSAGE_SUSPICIOUS: {
    guideId: 'GUIDE-MESSAGE-SUSPICIOUS-001',
    screen: 'MESSAGE_SUSPICIOUS',
    title: '의심스러운 링크 주의',
    summary: '출처가 불분명한 문자 링크는 누르지 않고 먼저 확인해야 해요.',
    actions: [{ order: 1, elementId: 'message-suspicious-focus', instruction: '발신번호와 확인하러 가기 링크가 함께 보이죠? 출처가 불분명한 링크는 누르면 안 돼요. 앱을 설치하거나 개인정보를 입력하게 할 수 있으니 공식 앱이나 대표번호로 직접 확인해 주세요.' }]
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

function normalizeTutorGuide(guide: TutorGuide): TutorGuide {
  return {
    ...guide,
    actions: guide.actions.map((action) => {
      if (action.elementId === 'settings-home-button' || action.elementId === 'message-home-button') {
        return { ...action, elementId: 'home-tab' }
      }
      return action
    })
  }
}

// GET /api/tutor/guides
export async function fetchTutorGuide(screen: ScreenCode, locale = 'ko-KR'): Promise<TutorGuide> {
  if (USE_MOCK) {
    await mockDelay(150)
    return normalizeTutorGuide(MOCK_GUIDES[screen] || MOCK_GUIDES.HOME)
  }
  const guide = await apiClient.get('/tutor/guides', { params: { screen, locale } }) as unknown as TutorGuide
  return normalizeTutorGuide(guide)
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
      overallScore: 42,
      strengths: ['AI 도우미 안내를 다시 확인하려고 했어요.'],
      difficultSteps: [
        { stepCode: 'SELECT_SOURCE_ACCOUNT', reason: '출금 계좌를 잘못 골랐어요.', timeSpentSeconds: 75 },
        { stepCode: 'ENTER_RECIPIENT_ACCOUNT', reason: '계좌번호를 여러 번 고쳤어요.', timeSpentSeconds: 98 },
        { stepCode: 'ENTER_AMOUNT', reason: '금액 확인 없이 다음을 누르려 했어요.', timeSpentSeconds: 80 },
        { stepCode: 'FINAL_REVIEW', reason: '받는 분과 금액 확인을 놓쳤어요.', timeSpentSeconds: 64 }
      ],
      recommendedSteps: ['SELECT_SOURCE_ACCOUNT', 'ENTER_RECIPIENT_ACCOUNT', 'ENTER_AMOUNT', 'FINAL_REVIEW']
    }
  }
  return apiClient.get(`/practices/${practiceId}/feedback`) as unknown as Promise<PracticeFeedback>
}
