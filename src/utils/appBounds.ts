/**
 * #app은 main.css에서 max-width:480px로 가운데 정렬되어 있습니다.
 * position:fixed 요소(오버레이, 모달, 플로팅 버튼 등)는 문서 흐름을 벗어나 뷰포트 기준으로
 * 배치되기 때문에, 넓은 화면(데스크톱)에서는 계산에 window.innerWidth를 그대로 쓰면
 * 실제 앱이 보이는 영역(가운데 480px 컬럼) 밖으로 튀어나가 버립니다.
 * 이 함수는 그 대신 기준으로 삼아야 할 '앱이 실제로 보이는 영역'을 반환합니다.
 */
export interface AppBounds {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export function getAppBounds(): AppBounds {
  const el = document.getElementById('app')
  if (el) {
    const rect = el.getBoundingClientRect()
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height
    }
  }
  // #app을 못 찾으면(테스트 환경 등) 뷰포트 전체를 기준으로 폴백
  return {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight
  }
}
