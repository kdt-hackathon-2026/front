import type { Scenario } from '@/types'

// GET /api/practices/scenarios 응답의 data.scenarios 를 모사합니다.
export const SCENARIOS: Scenario[] = [
  {
    scenarioId: 1,
    title: '병원비 보내기',
    difficulty: 'BEGINNER',
    recipientName: '이춘자',
    bankCode: 'KB',
    maskedAccountNumber: '943-***-582932',
    amount: 50000
  },
  {
    scenarioId: 2,
    title: '친목회비 보내기',
    difficulty: 'NORMAL',
    recipientName: '박철수',
    bankCode: 'NH',
    maskedAccountNumber: '456-***-901230',
    amount: 30000
  },
  {
    scenarioId: 3,
    title: '생활비 보내기',
    difficulty: 'BEGINNER',
    recipientName: '이춘자',
    bankCode: 'KB',
    maskedAccountNumber: '943-***-582932',
    amount: 50000
  }
]

export function getScenarioById(id: number | null | undefined): Scenario {
  return SCENARIOS.find((s) => s.scenarioId === id) || SCENARIOS[0]
}
