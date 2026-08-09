# 금융한걸음 프론트엔드 (Vue 3 + TypeScript + Vite)

## KB 계좌이체 통합 실습

- 진입: 홈의 `계좌이체 연습` → KB국민은행 선택 → 실제 은행 형태의 홈 → `계좌이체`
- 연습용 받는 계좌: `KB국민 94320200582932` (예금주 이춘자)
- 권장 연습 금액: `1,000원`
- 계좌 입력, 은행 선택, 금액·잔액 검증, 최종 확인, 완료 영수증, 거래내역까지 연결됩니다.
- 동일한 SVG 마스코트 AI 도우미가 은행 내부 화면마다 자동으로 단계별 안내를 제공합니다.
- 모든 장식 아이콘은 이모지 대신 `src/components/common/icons`의 SVG 아이콘을 사용합니다.

고령층·디지털 금융 취약계층 대상 **모의 계좌이체 반복 실습** 서비스의 프론트엔드입니다.
`금융한걸음_기능명세서.xlsx`의 온보딩(2.x) / 홈(3.x) / 은행 선택(4.x) / 모의 계좌이체 실습(6.x) 항목과
전달받은 화면 목업(온보딩·함께 해보기·스스로 해보기)을 기준으로 구현했습니다.

전체 코드는 TypeScript로 작성되어 있습니다 (`<script setup lang="ts">` + `vue-tsc` 타입 검사).

## TypeScript 구성

- `src/types/index.ts` — Bank/Account/Scenario/FlowState/Settings 등 앱 전역 도메인 타입
- `tsconfig.json` → `tsconfig.app.json`(브라우저용 src) / `tsconfig.node.json`(vite.config.ts) 참조 구조
- `npm run build` 는 `vue-tsc -b --noEmit && vite build` 순서로 **타입 오류가 있으면 빌드가 실패**합니다.
  타입 오류 없이 우선 산출물만 빠르게 뽑고 싶다면 `npm run build:skip-typecheck` 를,
  타입만 별도로 확인하려면 `npm run type-check` 를 사용하세요.
- `useSTT.ts`에는 브라우저 표준 TS lib에 없는 Web Speech API(SpeechRecognition)의
  최소 타입을 직접 선언해두었습니다. 실제 서비스에서 `@types/dom-speech-recognition` 같은
  패키지로 교체해도 됩니다.
- `api/client.ts`의 axios 응답 인터셉터가 `res.data`를 그대로 반환하도록 되어 있어,
  `apiClient.get/post`가 `AxiosResponse<T>`가 아니라 `T`를 직접 resolve합니다.
  `practiceApi.ts`에서 이 부분을 `as unknown as Promise<T>`로 명시적으로 캐스팅해 사용합니다
  (실제 백엔드 연동 시 이 캐스팅이 실제 응답 타입과 맞는지 한 번 더 확인해 주세요).

## 화면 구성

| 영역 | 경로 | 설명 |
|---|---|---|
| 홈 | `/` | 계좌이체 연습 / AI 튜터 / 처음 배우기 진입 |
| 온보딩 | `/onboarding/start` → `/onboarding/accessibility` → `/onboarding/bank` | 시작 방법 → 글자/음성 설정 → 주거래 은행 선택 |
| AI 튜터 | `/ai-tutor` | 자유 질문(텍스트/음성) |
| 함께 해보기 | `/together` → `/together/step/1~5` → `/together/complete` | AI 튜터 동반 6단계 튜토리얼 |
| 스스로 해보기 | `/practice` → `/practice/step/1~5` → `/practice/complete` | 독립 실습(시나리오/난이도 선택 포함) |

공통 컴포넌트는 `src/components/common/`에 있습니다 (`AppButton`, `AppHeader`, `SelectCard`,
`NumericKeypad`, `ConfirmRow`, `MascotTip`, `TipBox`, `VoiceControlBar`, `VoiceInputModal` 등).

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:5173, /api 요청은 vite.config.ts의 proxy로 백엔드(8080)로 전달됨
```

기본값은 **목데이터 모드**(`VITE_USE_MOCK=true`, `.env.development`)입니다.
Spring Legacy 컨트롤러가 준비되면 `src/api/practiceApi.ts`의 각 함수에서
`USE_MOCK` 분기 대신 실제 axios 호출만 타도록 자연스럽게 전환됩니다(코드 수정 없이 env 값만 `false`로 변경).

## Spring Legacy(WAR)에 합치는 방법

### 방법 A. 정적 산출물을 webapp에 그대로 복사 (가장 간단, 권장)

1. 컨텍스트 경로를 정합니다. 예: 톰캣에서 `/hangeoleum/` 아래로 서비스한다면 `.env.production`의
   `VITE_BASE_PATH=/hangeoleum/` 을 유지합니다. 루트 컨텍스트(`/`)로 서비스한다면 `/` 로 바꾸세요.
2. 빌드합니다.
   ```bash
   npm run build
   # dist/ 아래에 index.html, assets/ 생성됨
   ```
3. 빌드 산출물을 Spring Legacy 프로젝트의 `src/main/webapp/hangeoleum/` (컨텍스트 경로와 동일한 폴더명)로 복사합니다.
4. `web.xml` 또는 서블릿 매핑에서 정적 리소스(`*.js`, `*.css`, `*.svg` 등)가 Spring `DispatcherServlet`을
   거치지 않도록 예외 처리하거나, `<mvc:resources mapping="/hangeoleum/**" location="/hangeoleum/" />`
   (servlet-context.xml)로 정적 리소스 매핑을 추가합니다.
5. Vue Router는 `createWebHistory`(히스토리 모드)를 사용하므로, `/hangeoleum/practice/step/1` 처럼
   새로고침해도 `index.html`이 응답되도록 아래 중 하나가 필요합니다.
   - Spring MVC 컨트롤러에 `/hangeoleum/**` (API 경로 제외) 요청을 모두 `index.html`로 forward하는
     catch-all 핸들러 추가, 또는
   - Nginx/Apache 리버스 프록시 단에서 try_files 방식으로 index.html 폴백 처리.
   운영 환경 새로고침 이슈가 부담스럽다면 `router/index.ts`의 `createWebHistory`를
   `createWebHashHistory`로 바꾸면 서버 설정 없이도 바로 동작합니다(URL에 `#`이 붙습니다).

### 방법 B. JSP 레이아웃 안에 마운트 포인트만 넣고 자산은 CDN/별도 정적 서버로 서빙

기존 JSP 헤더/푸터를 유지해야 한다면 `index.html`의 `<div id="app">`과
`<script type="module" src="...">` 부분만 JSP에 옮기고, 빌드된 `assets/`는
`/resources/hangeoleum/` 같은 정적 리소스 폴더에 두면 됩니다. 이 경우 `vite.config.ts`의
`base`를 그 정적 경로로 맞춰주세요.

### API 연동

`src/api/client.ts`의 `baseURL`(`VITE_API_BASE_URL`, 기본 `/api`)을 Spring Legacy
컨트롤러의 실제 매핑 경로에 맞게 조정하세요. 기능명세서 6.x 기준으로 아래 컨트롤러를 제안합니다.

```
GET  /api/banks
GET  /api/practice/accounts
GET  /api/practice/scenarios
POST /api/practice/sessions                    { mode, scenarioId }
POST /api/practice/sessions/{id}/receiver       { accountNumber, bankCode }   // 가상 수취인 조회
POST /api/practice/sessions/{id}/complete       { requestId, ... }            // 멱등키로 중복 처리 방지
POST /api/practice/logs                          완료/오류/도움 사용 요약 저장
```

Spring Legacy가 세션 기반 인증(JSESSIONID)을 쓴다면 `client.ts`의 `withCredentials: true`를
그대로 두면 되고, CORS를 쓰는 별도 도메인 배포라면 서버 쪽에 `Access-Control-Allow-Credentials`
설정이 필요합니다.

## 접근성/음성 관련 주의사항

- TTS는 브라우저 `speechSynthesis`(`src/composables/useTTS.ts`), STT는 `SpeechRecognition`
  (`src/composables/useSTT.ts`)을 사용합니다. 두 API 모두 **브라우저 지원 여부가 다르므로**
  미지원 브라우저에서는 자동으로 버튼/텍스트 입력 대체 흐름을 타도록 구성되어 있습니다
  (기능명세 8.70 요구사항).
- 실제 계좌번호·비밀번호·OTP는 어떤 화면에서도 입력받지 않으며, 모든 데이터는 `src/assets/data/`의
  가상 데이터입니다. 백엔드 연동 시에도 이 원칙(14.70 개인정보 최소화)을 유지해 주세요.

## 폴더 구조

```
src/
  api/            axios 클라이언트 + 백엔드 연동 함수 (목데이터 폴백 포함)
  assets/data/    가상 은행/계좌/시나리오/수취인 데이터
  assets/styles/  디자인 토큰 (색상/타이포/여백)
  components/common/  공통 UI 컴포넌트
  composables/    useTTS, useSTT
  router/         vue-router 라우트 정의
  stores/         Pinia - 설정값 + 실습 진행 상태
  views/          화면별 컴포넌트 (onboarding / together / practice)
```
