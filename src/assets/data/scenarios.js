// 실습 시나리오(연습 상황) - 실제 서비스에서는 GET /api/practice/scenarios 로 교체
export const SCENARIOS = [
  {
    id: 'scn-hospital',
    title: '병원비 보내기',
    description: '어머니 병원비 10만원을 가은행 김민지님께 보내보세요.',
    receiverName: '김민지',
    receiverBankCode: 'a-bank',
    accountNumber: '123-45-67890',
    amount: 100000,
    icon: '🏥'
  },
  {
    id: 'scn-membership',
    title: '친목회비 보내기',
    description: '이번 달 친목회비 3만원을 나은행 박철수님께 보내보세요.',
    receiverName: '박철수',
    receiverBankCode: 'b-bank',
    accountNumber: '456-78-90123',
    amount: 30000,
    icon: '🤝'
  },
  {
    id: 'scn-living',
    title: '생활비 보내기',
    description: '용돈 5만원을 가은행 김한걸음님께 보내보세요.',
    receiverName: '김한걸음',
    receiverBankCode: 'a-bank',
    accountNumber: '123-456-789012',
    amount: 50000,
    icon: '🏠'
  }
]

export function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) || SCENARIOS[0]
}
