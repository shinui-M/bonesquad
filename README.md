# 뼈갈단 (Bonesquad)

뼈를 갈아서라도 성공하자! 함께 성장하는 스터디 그룹 웹 애플리케이션

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Link)
- **Realtime**: Supabase Realtime

## 기능

- **주간 캘린더**: 매일의 학습/성과 기록 및 공유
- **뼈이스북**: SNS 스타일 피드 및 댓글
- **스터디 그룹**: 오픽, 다이어트 등 관심사별 그룹 활동
- **멤버**: 스터디 그룹 멤버 목록

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 정보를 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 마이그레이션용 (선택)
```

### 3. Supabase 데이터베이스 설정

`supabase/schema.sql` 파일의 내용을 Supabase SQL Editor에서 실행

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인

## 프로젝트 구조

```
bonesquad/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/callback/      # Auth 콜백 라우트
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 메인 페이지
│   │   └── globals.css         # 전역 스타일
│   │
│   ├── components/
│   │   ├── auth/               # 인증 컴포넌트
│   │   ├── calendar/           # 주간 캘린더 컴포넌트
│   │   ├── feed/               # 피드 컴포넌트
│   │   ├── group/              # 그룹 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── member/             # 멤버 컴포넌트
│   │   └── ui/                 # 재사용 UI 컴포넌트
│   │
│   └── lib/
│       ├── supabase/           # Supabase 클라이언트
│       ├── hooks/              # Custom React Hooks
│       ├── types/              # TypeScript 타입
│       └── utils/              # 유틸리티 함수
│
├── supabase/
│   └── schema.sql              # DB 스키마
│
└── scripts/
    └── migrate-data.ts         # 데이터 마이그레이션 스크립트
```

## 데이터 마이그레이션 (선택)

기존 Google Sheets 데이터를 마이그레이션하려면:

```bash
# 환경 변수 설정 후
GOOGLE_SCRIPT_URL=your-apps-script-url npx ts-node scripts/migrate-data.ts
```

## 배포

Vercel에 배포하기:

```bash
npm run build
vercel --prod
```

## 라이선스

MIT
