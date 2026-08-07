import type { Bank } from '@/types'

// GET /api/practices/banks 응답의 data.banks 를 그대로 모사합니다.
// 실제 서비스에서는 fetchBanks()(api/practiceApi.ts)가 이 배열 대신 서버 응답을 사용합니다.
export const BANKS: Bank[] = [
  {
    bankCode: 'KB',
    bankName: 'KB국민은행',
    iconUrl: 'https://cdn.example.com/banks/kb.png',
    themeColor: '#FFBC00',
    stepLabels: ['받는분', '계좌', '금액', '확인']
  },
  {
    bankCode: 'NH',
    bankName: 'NH농협은행',
    iconUrl: 'https://cdn.example.com/banks/nh.png',
    themeColor: '#00A651',
    stepLabels: ['받는분', '계좌', '금액', '확인']
  },
  {
    bankCode: 'SH',
    bankName: '신한은행',
    iconUrl: 'https://cdn.example.com/banks/sh.png',
    themeColor: '#0046FF',
    stepLabels: ['받는분', '계좌', '금액', '확인']
  }
]

export function getBankByCode(code: string | null | undefined): Bank | null {
  return BANKS.find((b) => b.bankCode === code) || null
}
