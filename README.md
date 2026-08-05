# Frontend

Vue 3와 TypeScript를 사용하는 프론트엔드 기본 프로젝트입니다.

- TODO(확인 필요): 공식 프로젝트명
- TODO(확인 필요): 서비스 설명과 핵심 사용자 흐름
- TODO(확인 필요): API 명세와 인증 방식

## 기술 스택

- Vue 3 Composition API
- TypeScript (strict)
- Vite
- Pinia
- Vue Router
- Tailwind CSS v4
- Axios

## 시작하기

Node.js `20.19.0` 이상이 필요합니다.

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_API_BASE_URL`은 API 서버가 확정된 뒤 로컬 `.env`에 설정합니다. 실제 환경변수 파일은
Git에 포함하지 않습니다.

## 주요 명령

```bash
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm run build
```

## 구조

이 프로젝트는 MVVM 경계를 기준으로 구성합니다.

- Model: `src/apis`, `src/types`, `src/models`
- ViewModel: `src/stores`, `src/composables`
- View: `src/views`, `src/components`, `src/layouts`

세부 개발 규칙은 `AGENTS.md`를 확인하세요.
