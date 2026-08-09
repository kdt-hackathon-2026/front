// ============================================================
// 도메인 타입 정의 - API_명세서_-_시트1.pdf 기준
// (은행 코드/이름은 이제 백엔드가 실제 값으로 내려주므로 그대로 사용합니다.
//  예전 버전의 '가은행/나은행' 가상 명칭은 더 이상 쓰지 않습니다.)
// ============================================================

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  errorCode?: string | null
}

/** 서버 공통 에러 응답 포맷 (성공 시에도 이 형태로 감싸져 오지만, 실패 시 주로 이 필드를 씁니다) */
export interface ApiErrorPayload {
  success: false
  message: string
  errorCode: string
  data: null
}

// ---------------------------------------------------------
// 공통 코드값
// ---------------------------------------------------------

export type BankCode = string // 예: 'KB', 'NH' - GET /api/practices/banks 로 서버에서 내려주는 값
export type HelpLevel = 'BEGINNER' | 'NORMAL' | 'ADVANCED'
export type TextSize = 'BASIC' | 'LARGE' | 'XLARGE'
export type ButtonSize = 'BASIC' | 'LARGE'
export type ScreenCode =
  | 'HOME'
  | 'ONBOARDING_INTRO'
  | 'BANK_SELECTION'
  | 'TRANSFER_PRACTICE'
  | 'HELP_LEVEL'
  | 'SOURCE_ACCOUNT'
  | 'RECIPIENT_ACCOUNT'
  | 'ENTER_AMOUNT'
  | 'FINAL_REVIEW'
  | 'AUTHENTICATION'
  | 'RESULT'
  | 'AI_TUTOR'
  | 'HOME_MESSAGES'
  | 'HOME_TRANSFER'
  | 'APP_SETTINGS'
  | 'MESSAGES'
  | 'MESSAGE_DETAIL'
  | 'MESSAGE_COPY'
  | 'MESSAGE_HOME'
  | 'MESSAGE_SUSPICIOUS'

export type StepCode =
  | 'SELECT_SOURCE_ACCOUNT'
  | 'ENTER_RECIPIENT_ACCOUNT'
  | 'ENTER_AMOUNT'
  | 'FINAL_REVIEW'
  | 'AUTHENTICATION'
  | 'TRANSFER'

// ---------------------------------------------------------
// GET /api/home
// ---------------------------------------------------------

export interface QuickMenu {
  code: 'TRANSFER_PRACTICE' | 'AI_TUTOR' | 'START_FROM_BEGINNING' | string
  title: string
  enabled: boolean
}

export interface ResumePractice {
  practiceId: number
  bankCode: BankCode
  scenarioTitle: string
  currentStep: StepCode
  progressRate: number
}

export interface VoiceGuideInfo {
  enabled: boolean
  welcomeMessage: string
}

export interface HomeData {
  isFirstVisit: boolean
  quickMenus: QuickMenu[]
  resumePractice: ResumePractice | null
  voiceGuide: VoiceGuideInfo
}

// ---------------------------------------------------------
// 사용자 설정 GET/PATCH /api/users/settings
// ---------------------------------------------------------

export interface UserSettings {
  defaultBankCode: BankCode
  helpLevel: HelpLevel
  voiceGuideEnabled: boolean
  textSize: TextSize
  buttonSize: ButtonSize
  highContrastEnabled: boolean
  speechRate: number
  voiceVolume: number
}

// ---------------------------------------------------------
// GET /api/practices/summary
// ---------------------------------------------------------

export interface RecentPractice {
  practiceId: number
  scenarioTitle: string
  completedAt: string
}

export interface PracticeSummary {
  resumablePractice: ResumePractice | null
  recentPractices: RecentPractice[]
  difficultSteps: StepCode[]
}

// ---------------------------------------------------------
// AI 튜터 - GET /api/tutor/guides
// ---------------------------------------------------------

export interface TutorGuideAction {
  order: number
  elementId: string
  instruction: string
}

export interface TutorGuide {
  guideId: string
  screen: ScreenCode
  title: string
  summary: string
  actions: TutorGuideAction[]
}

// POST /api/tutor/navigation
export interface TutorNavigationRequest {
  currentScreen: ScreenCode
  userMessage: string
}
export interface TutorNavigationResult {
  intent: string
  targetScreen: ScreenCode
  path: ScreenCode[]
  highlightElementId: string
  spokenGuide: string
}

// POST /api/tutor/screens/explain
export interface TutorExplainRequest {
  currentScreen: ScreenCode
  context?: Record<string, unknown>
}
export interface TutorExplainResult {
  purpose: string
  essentialInfo: string[]
  nextAction: string
  highlightElementId: string
}

// POST /api/tutor/speech
export interface TutorSpeechRequest {
  text: string
  locale: string
  speechRate: number
}
export interface TutorSpeechResult {
  audioUrl: string
  durationMs: number
  speechRate: number
}

// POST /api/tutor/voice/recognize
export interface VoiceRecognizeResult {
  transcript: string
  intent: string
  confidence: number
  fallbackRequired: boolean
}

// POST /api/tutor/events
export interface TutorEventRequest {
  practiceId: number | null
  screen: ScreenCode
  eventType: 'WRONG_CLICK' | 'IDLE' | 'ERROR' | string
  elementId: string
  durationMs: number
  occurredAt: string
}
export interface TutorEventResult {
  eventId: number
  assistanceLevel: 'NONE' | 'SIMPLE_HINT' | 'HIGHLIGHT' | 'FULL_GUIDE'
  sensitiveDataStored: boolean
}

// POST /api/tutor/hints
export interface TutorHintRequest {
  practiceId: number
  stepCode: StepCode
  recentErrorCount: number
  idleSeconds: number
}
export interface TutorHintResult {
  hintLevel: 'SIMPLE_HINT' | 'HIGHLIGHT' | 'FULL_GUIDE'
  message: string
  highlightElementId: string
  audioGuideUrl?: string
}

// GET /api/practices/{id}/feedback
export interface FeedbackDifficultStep {
  stepCode: StepCode
  reason: string
  timeSpentSeconds: number
}
export interface PracticeFeedback {
  practiceId: number
  overallScore: number
  strengths: string[]
  difficultSteps: FeedbackDifficultStep[]
  recommendedSteps: StepCode[]
}

// ---------------------------------------------------------
// 연습 시나리오 / 은행 목록
// ---------------------------------------------------------

export type ScenarioDifficulty = 'BEGINNER' | 'NORMAL'
export type ScenarioCategory = 'LIVING_EXPENSE' | 'DUES' | 'MEDICAL'

export interface Scenario {
  scenarioId: number
  title: string
  difficulty: ScenarioDifficulty
  recipientName: string
  bankCode: BankCode
  maskedAccountNumber: string
  amount: number
}

export interface Bank {
  bankCode: BankCode
  bankName: string
  iconUrl: string
  themeColor: string
  stepLabels: string[] // 예: ["받는분","계좌","금액","확인"]
}

// ---------------------------------------------------------
// 이체연습 세션
// ---------------------------------------------------------

export interface PracticeMission {
  recipientName: string
  bankCode: BankCode
  maskedAccountNumber: string
  amount: number
}

export interface StartPracticeRequest {
  scenarioId: number
  bankCode: BankCode
  helpLevel: HelpLevel
}
export interface StartPracticeResult {
  practiceId: number
  status: 'IN_PROGRESS' | 'COMPLETED'
  currentStep: StepCode
  mission: PracticeMission
  isRealTransfer: false
}

export interface PracticeAccount {
  accountId: string
  bankCode: BankCode
  accountName: string
  maskedAccountNumber: string
  balance: number
}

export interface SelectSourceAccountResult {
  practiceId: number
  selectedAccountId: string
  nextStep: StepCode
}

export interface ValidateRecipientRequest {
  bankCode: BankCode
  accountNumber: string
}
export interface ValidateRecipientResult {
  valid: boolean
  maskedAccountNumber: string
  errorCode: string | null
  guideMessage: string
}

export interface ConfirmRecipientRequest {
  bankCode: BankCode
  accountNumber: string
  confirmedByUser: boolean
}
export interface ConfirmRecipientResult {
  recipientName: string
  bankName: string
  maskedAccountNumber: string
  matchesScenario: boolean
  confirmationToken: string
}

export interface ValidateAmountResult {
  valid: boolean
  amount: number
  koreanAmount: string
  virtualBalance: number
  remainingBalance: number
  errorCode: string | null
}

export interface ReviewAccountInfo {
  accountName: string
  maskedAccountNumber: string
}
export interface ReviewRecipientInfo {
  name: string
  bankName: string
  maskedAccountNumber: string
}
export type ReviewCheckItem = 'RECIPIENT' | 'ACCOUNT' | 'AMOUNT'
export interface PracticeReview {
  sourceAccount: ReviewAccountInfo
  recipient: ReviewRecipientInfo
  amount: number
  koreanAmount: string
  checks: ReviewCheckItem[]
  canProceed: boolean
}

export interface AuthenticationRequest {
  educationCode: string
  acknowledgedNoRealInfo: boolean
}
export interface AuthenticationResult {
  verified: boolean
  authToken: string
  expiresInSeconds: number
  warning: string
}

export interface TransferRequest {
  authToken: string
  confirmed: boolean
}
export interface TransferResult {
  transactionId: string
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
  isRealTransfer: false
}

export interface PracticeResultSummary {
  bankName: string
  recipientName: string
  maskedAccountNumber: string
  amount: number
  timeSpentSeconds: number
}
export interface StepResult {
  stepCode: StepCode
  result: 'PASS' | 'FAIL'
  mistakeCount: number
}
export interface PracticeResult {
  practiceId: number
  status: 'COMPLETED' | 'IN_PROGRESS'
  isRealTransfer: false
  summary: PracticeResultSummary
  stepResults: StepResult[]
}

export interface SaveProgressRequest {
  currentStep: StepCode
  helpUsageCount: number
  elapsedSeconds: number
  saveForResume: boolean
}
export interface SaveProgressResult {
  practiceId: number
  currentStep: StepCode
  saved: boolean
  resumable: boolean
  expiresAt: string
}

export interface ResumablePracticeItem {
  practiceId: number
  scenarioTitle: string
  bankCode: BankCode
  currentStep: StepCode
  progressRate: number
  expiresAt: string
}

export type RestartMode = 'SAME_SCENARIO' | 'NEW_SCENARIO' | 'OTHER_BANK'
export interface RestartRequest {
  mode: RestartMode
  bankCode: BankCode
}
export interface RestartResult {
  previousPracticeId: number
  newPracticeId: number
  scenarioId: number
  bankCode: BankCode
  currentStep: StepCode
}
