// 연습용 출금 계좌 목록 - 실제 서비스에서는 GET /api/practice/accounts 로 교체
// 실제 계좌·잔액이 아닌 교육용 가상 데이터입니다.
export const ACCOUNTS = [
  {
    id: 'acc-living',
    name: '생활비 통장',
    bankName: '한걸음은행',
    numberMasked: '123-45-****01',
    balance: 850000,
    icon: '💰'
  },
  {
    id: 'acc-allowance',
    name: '용돈 통장',
    bankName: '한걸음은행',
    numberMasked: '987-65-****04',
    balance: 120000,
    icon: '👛'
  },
  {
    id: 'acc-membership',
    name: '친목회 통장',
    bankName: '한걸음은행',
    numberMasked: '555-11-****22',
    balance: 300000,
    icon: '🤝'
  }
]

export function getAccountById(id) {
  return ACCOUNTS.find((a) => a.id === id) || null
}
