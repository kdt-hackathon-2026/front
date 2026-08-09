export interface BankThemePreset {
  primaryDark: string
  primaryLight: string
  onPrimary: string
  /** true면 실제 앱처럼 헤더 워드마크 + 퀵메뉴 레이아웃을 씁니다 (KB/NH 등 브랜드 테마) */
  branded: boolean
  quickMenuIcons?: string[] // src/components/common/icons/registry.ts 의 아이콘 이름
  quickMenuLabels?: string[]
}

const DEFAULT_PRESET: BankThemePreset = {
  primaryDark: '#16305f',
  primaryLight: '#e8f0fe',
  onPrimary: '#ffffff',
  branded: false
}

// 참고 디자인: KB국민은행 스타뱅킹(골드), NH농협은행 뱅킹(초록) - 실제 로고/워드마크는 쓰지 않고
// 색상·레이아웃 관례만 참고해 교육용으로 재구성했습니다 (기능명세 4.40).
const PRESETS: Record<string, BankThemePreset> = {
  KB: {
    primaryDark: '#e0a300',
    primaryLight: '#fff6db',
    onPrimary: '#2b2308', // 골드 배경 위 텍스트는 밝은색 대신 짙은 브라운/블랙 사용
    branded: true,
    quickMenuIcons: ['search', 'transfer', 'plus', 'chart', 'menu'],
    quickMenuLabels: ['조회', '이체', '상품가입', '자산관리', '전체']
  },
  NH: {
    primaryDark: '#00823f',
    primaryLight: '#e2f6ea',
    onPrimary: '#ffffff',
    branded: true,
    quickMenuIcons: ['search', 'transfer', 'plus', 'leaf', 'menu'],
    quickMenuLabels: ['조회', '이체', '상품가입', '농협정보', '전체']
  }
}

export function getBankThemePreset(bankCode: string | null | undefined): BankThemePreset {
  if (!bankCode) return DEFAULT_PRESET
  return PRESETS[bankCode] || DEFAULT_PRESET
}
