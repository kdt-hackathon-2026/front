// 은행 목록 - 실제 서비스에서는 GET /api/banks 로 서버에서 내려주는 값으로 교체
// (기획: 고령층 이용 통계 근거 상위 1~5위 은행, 현재는 화면 목업에 맞춰 3개 예시)
//
// theme: 은행별 화면 템플릿(기능명세 4.40) - 실제 은행 앱의 색상·레이아웃 관례를 참고해
// 교육 목적으로 재구성했습니다. 화면(헤더 등)에는 실제 은행 상호를 절대 노출하지 않고
// 항상 가상 은행 이름(가은행/나은행/다은행)만 보여줍니다. 아래 주석의 실제 은행명은
// 개발자가 참고한 디자인 소스를 기록해 두는 용도일 뿐, UI 문자열로는 쓰이지 않습니다.
export const BANKS = [
  {
    code: 'a-bank',
    name: '가은행',
    shortName: '가',
    color: '#2f6fed',
    supported: true,
    theme: {
      variant: 'kb', // 참고 디자인: KB국민은행 스타뱅킹 (골드 포인트 컬러 + 퀵메뉴 레이아웃)
      primary: '#ffbc00',
      primaryDark: '#e0a300',
      primaryLight: '#fff6db',
      onPrimary: '#2b2308', // 골드 배경 위 텍스트는 밝은색 대신 짙은 브라운/블랙 사용
      headerBg: '#ffffff',
      headerText: '#1b1f27',
      motif: '★',
      quickMenu: ['조회', '이체', '상품가입', '자산관리', '전체']
    }
  },
  {
    code: 'b-bank',
    name: '나은행',
    shortName: '나',
    color: '#00a651',
    supported: true,
    theme: {
      variant: 'nh', // 참고 디자인: NH농협은행 뱅킹 (초록 포인트 컬러 + 퀵메뉴 레이아웃)
      primary: '#00a651',
      primaryDark: '#00823f',
      primaryLight: '#e2f6ea',
      onPrimary: '#ffffff',
      headerBg: '#ffffff',
      headerText: '#1b1f27',
      motif: '🌾',
      quickMenu: ['조회', '이체', '상품가입', '농협정보', '전체']
    }
  },
  {
    code: 'c-bank',
    name: '다은행',
    shortName: '다',
    color: '#1e8e5a',
    supported: true,
    theme: {
      variant: 'default',
      primary: '#1e8e5a',
      primaryDark: '#136b42',
      primaryLight: '#e3f5ec',
      onPrimary: '#ffffff',
      headerBg: '#ffffff',
      headerText: '#1b1f27'
    }
  }
]

export function getBankByCode(code) {
  return BANKS.find((b) => b.code === code) || null
}
