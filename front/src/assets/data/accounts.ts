import type { PracticeAccount } from '@/types'

// GET /api/practices/{practiceId}/accounts 응답의 data.accounts 를 모사합니다.
// 실제 계좌·잔액이 아닌 교육용 가상 데이터입니다.
export const ACCOUNTS: PracticeAccount[] = [
  {
    accountId: 'VIRTUAL-ACCOUNT-001',
    bankCode: 'KB',
    accountName: '연습용 생활비 통장',
    maskedAccountNumber: '111-***-222222',
    balance: 850000
  },
  {
    accountId: 'VIRTUAL-ACCOUNT-002',
    bankCode: 'KB',
    accountName: '연습용 용돈 통장',
    maskedAccountNumber: '987-***-654321',
    balance: 120000
  },
  {
    accountId: 'VIRTUAL-ACCOUNT-003',
    bankCode: 'KB',
    accountName: '연습용 친목회 통장',
    maskedAccountNumber: '555-***-112233',
    balance: 300000
  }
]

export function getAccountById(id: string | null | undefined): PracticeAccount | null {
  return ACCOUNTS.find((a) => a.accountId === id) || null
}
