// 가상 수취인 DB - 계좌번호 -> 이름 조회용 (실제 금융기관 API를 호출하지 않음)
// 실제 서비스에서는 POST /api/practice/session/{id}/receiver 로 서버 조회 결과를 받습니다.
export const VIRTUAL_RECEIVERS = {
  '123-45-67890': '김민지',
  '456-78-90123': '박철수',
  '123-456-789012': '김한걸음',
  '987-65-04321': '이영희'
}

// 하이픈 유무와 상관없이 매칭되도록 숫자만 남겨서 비교합니다.
// (계좌번호 입력 키패드는 하이픈 없이 숫자만 이어붙이기 때문)
function onlyDigits(v) {
  return (v || '').replace(/\D/g, '')
}

const DIGITS_LOOKUP = Object.fromEntries(
  Object.entries(VIRTUAL_RECEIVERS).map(([key, name]) => [onlyDigits(key), name])
)

export function lookupReceiverByAccount(accountNumber) {
  const normalized = onlyDigits(accountNumber)
  return DIGITS_LOOKUP[normalized] || null
}
