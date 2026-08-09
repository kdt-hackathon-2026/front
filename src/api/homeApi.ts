import { apiClient, USE_MOCK, mockDelay } from './client'
import type { HomeData, PracticeSummary, UserSettings } from '@/types'

const MOCK_SETTINGS: UserSettings = {
  defaultBankCode: 'KB',
  helpLevel: 'BEGINNER',
  voiceGuideEnabled: true,
  textSize: 'LARGE',
  buttonSize: 'LARGE',
  highContrastEnabled: false,
  speechRate: 0.8,
  voiceVolume: 0.4
}

let mockFirstVisit = true

// GET /api/home
export async function fetchHome(): Promise<HomeData> {
  if (USE_MOCK) {
    await mockDelay(150)
    const data: HomeData = {
      isFirstVisit: mockFirstVisit,
      quickMenus: [
        { code: 'TRANSFER_PRACTICE', title: '계좌이체 연습', enabled: true },
        { code: 'AI_TUTOR', title: 'AI 튜터', enabled: true },
        { code: 'START_FROM_BEGINNING', title: '처음부터 배우기', enabled: true }
      ],
      resumePractice: null,
      voiceGuide: { enabled: true, welcomeMessage: '원하는 기능을 선택해 주세요.' }
    }
    mockFirstVisit = false
    return data
  }
  return apiClient.get('/home') as unknown as Promise<HomeData>
}

// GET /api/users/settings
export async function fetchUserSettings(): Promise<UserSettings> {
  if (USE_MOCK) {
    await mockDelay(120)
    return { ...MOCK_SETTINGS }
  }
  return apiClient.get('/users/settings') as unknown as Promise<UserSettings>
}

// PATCH /api/users/settings
export async function updateUserSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  if (USE_MOCK) {
    await mockDelay(150)
    Object.assign(MOCK_SETTINGS, patch)
    return { ...MOCK_SETTINGS }
  }
  return apiClient.patch('/users/settings', patch) as unknown as Promise<UserSettings>
}

// GET /api/practices/summary
export async function fetchPracticeSummary(): Promise<PracticeSummary> {
  if (USE_MOCK) {
    await mockDelay(150)
    return {
      resumablePractice: null,
      recentPractices: [],
      difficultSteps: []
    }
  }
  return apiClient.get('/practices/summary') as unknown as Promise<PracticeSummary>
}
