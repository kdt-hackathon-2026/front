// 가상 수취인 DB - (은행코드, 계좌번호) -> 이름 조회용
// 실제 서비스에서는 POST /api/practices/{id}/recipient/validate, /recipient/confirm 으로
// 서버가 계산한 결과를 그대로 받습니다. 여기 있는 숫자는 시나리오 데이터와 짝을 맞춘
// 연습용 값이며 실제 금융기관 계좌와 무관합니다.
interface VirtualReceiverEntry {
  bankCode: string
  accountNumber: string // 하이픈 없는 순수 숫자
  name: string
}

export const VIRTUAL_RECEIVERS: VirtualReceiverEntry[] = [
  { bankCode: 'KB', accountNumber: '123456789012', name: '김하나' },
  { bankCode: 'NH', accountNumber: '456789012300', name: '박철수' },
  { bankCode: 'KB', accountNumber: '123456789013', name: '김한걸음' }
]

function onlyDigits(v: string | null | undefined): string {
  return (v || '').replace(/\D/g, '')
}

export function lookupReceiver(bankCode: string | null | undefined, accountNumber: string | null | undefined): string | null {
  const digits = onlyDigits(accountNumber)
  const found = VIRTUAL_RECEIVERS.find((r) => r.bankCode === bankCode && r.accountNumber === digits)
  return found?.name || null
}

export function maskAccountNumber(accountNumber: string | null | undefined): string {
  const digits = onlyDigits(accountNumber)
  if (digits.length < 6) return accountNumber || ''
  const head = digits.slice(0, 3)
  const tail = digits.slice(-6)
  return `${head}-***-${tail}`
}
