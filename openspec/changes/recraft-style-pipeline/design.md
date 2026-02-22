## Context

### 이전 실험 결과
- Claude SVG: 통제 쉬움, 시각적 단순 → production 부적합
- Recraft V3 emotional_flat: 시각적 풍부, 배경 통제 불가 → 일관성 부족
- **핵심 문제**: 좋은 품질 + 일관성을 동시에 달성하는 방법이 필요

### Recraft 커스텀 스타일 API
```
POST /v1/styles
body: { style: "vector_illustration", images: [file1, file2, ...] }
→ { id: "style_abc123" }
```
- reference 이미지 1~5장으로 커스텀 스타일 등록
- 이후 생성 시 `styleID` 파라미터로 해당 스타일 적용
- MCP 도구: `mcp__recraft__create_style`, `mcp__recraft__generate_image(styleID=...)`

## Goals / Non-Goals

**Goals:**
- Recraft 커스텀 스타일로 **시각적 품질 + 일관성** 동시 달성
- 30개 production 아이콘을 통일된 스타일로 재생성
- 사람 검수 기반 채점 캘리브레이션으로 AI 평가의 신뢰도 확보
- 빠른 피드백 루프: 5장 트라이얼 → 사람 승인 → 배치

**Non-Goals:**
- asset-matcher.ts 등록 (별도 change)
- 교차 API 이식성 검증 (별도 실험으로 분리)

## Decisions

### 1. 사람 판단 우선 (Human-First Calibration)

**결정**: AI 채점 기준을 사전에 정의하지 않고, 사람이 트라이얼을 승인한 뒤 그 결과에서 역산

**이유**:
- 이전 접근(AI가 T&M 기준 12항+6항 정의)은 사람 기준과 괴리 위험
- 사람이 "좋다"고 한 에셋을 골드 스탠다드로 삼으면 채점이 실제 선호와 일치
- 채점 프롬프트에 골드 스탠다드 이미지를 레퍼런스로 첨부 → 시각적 비교 기반 채점

**대안 (기각)**:
- AI가 Kurzgesagt 프레임 분석해서 채점 기준 사전 정의 → 과설계, 사람 기준과 불일치 가능

### 2. Reference 이미지 확보 방법

**결정**: 사람이 직접 레퍼런스 수집 → AI가 적합도 평가 → Recraft create_style 등록

**이유**:
- 사람이 원하는 톤을 사람이 직접 고르는 게 가장 정확
- AI는 "이 세트로 일관된 생성이 가능한가?"를 판단하는 역할
- Recraft로 생성한 것을 reference로 쓰는 것도 가능 (사람이 골라서 넣으면 됨)

### 3. 단순한 채점 체계

**결정**: 스타일 일치도 10점 (단일 축) + 보조 2개 (배경 P/F, 식별성 P/F)

**이유**:
- 이전 접근(21개 기준, 90점 만점)은 과도 — 점수가 많다고 정확한 게 아님
- 골드 스탠다드 이미지를 레퍼런스로 붙여서 "얼마나 같은 느낌인가?" 한 문장이면 충분
- 보조 항목은 Pass/Fail로 단순화

### 4. 빌더 내 에셋 검수 UI

**결정**: Scene Builder에 "에셋 검수" 탭을 추가하여 레퍼런스 관리 + 트라이얼 검수를 UI 안에서 수행

**이유**:
- Phase 0(레퍼런스 수집)과 Phase 1(사람 검수)이 파일시스템 직접 조작 → 비효율
- 빌더에 탭 하나 추가하면 업로드/삭제/승인/거부/피드백을 한 곳에서 처리 가능
- 검수 결과가 `review.json`으로 저장되어 후속 Phase에서 자동 참조 가능

**구현**:
- `builder/src/components/AssetReview.tsx` — 레퍼런스 그리드 + 트라이얼 검수 UI
- `builder/vite.config.ts` — 7개 API 엔드포인트 (이미지 목록/서빙/업로드/삭제/검수 저장·로드)
- Gate 판정: 80% 승인 기준 자동 PASS/FAIL 표시

### 5. QA는 Recraft 생성 + Claude 채점

**결정**: 생성은 Recraft, 채점은 Claude Vision (변경 없음)

**이유**:
- Recraft 생성 + Claude 채점이면 self-bias 없음
- Claude Vision으로 PNG 이미지를 직접 시각 분석

## Risks / Trade-offs

**[레퍼런스 품질 의존]** → 사람이 수집한 레퍼런스가 애매하면 전체가 흔들림. 적합도 평가 단계에서 조기 차단.

**[캘리브레이션 실패]** → 승인된 에셋이 적어서 (3장 미만) 채점 프롬프트가 정확하지 않을 수 있음. 거부된 에셋도 역검증에 활용하여 보완.

**[Recraft 크레딧 소진]** → 트라이얼 반복 시 크레딧 소모 증가. 현재 3000 크레딧, 트라이얼 2~3회 + 배치 + 재생성 ≈ 80 호출. 충분.

**[배경 통제]** → create_style이 배경까지 학습하는지 불확실. 안 되면 remove_background + replace_background 후처리.

**[substyle과 styleID 충돌]** → Recraft API에서 style과 styleID는 상호배타. styleID 사용 시 substyle 지정 불가.
