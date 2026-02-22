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
- 기존 QA 체계(10항목 × 5점)로 품질 검증
- 사람 시각 검수 포함

**Non-Goals:**
- 새로운 QA 기준 설계 (기존 것 재사용)
- asset-matcher.ts 등록 (별도 change)
- Claude SVG와 재비교 (이미 결론남)

## Decisions

### 1. Reference 이미지 확보 방법

**결정**: Recraft로 "이상적인" 아이콘을 먼저 몇 개 생성하고, 가장 잘 나온 것을 reference로 사용

**이유**:
- Phase A의 금화 아이콘이 가장 잘 나왔음 (네이비 배경, 골드 톤)
- 추가로 2~3개를 다른 substyle/프롬프트로 시도해서 최적 조합 탐색
- 최고 결과 3~5장을 create_style에 등록

**대안**:
- 외부 아이콘 세트를 reference로 사용 → 저작권 이슈, 스타일 매칭 불확실
- Phase A 결과 그대로 사용 → emotional_flat 스타일이 섞여서 부적합할 수 있음

### 2. substyle 탐색

**결정**: reference 생성 시 여러 substyle을 시도하여 최적 선택

**후보**:
- `emotional_flat` — Phase A에서 사용, 풍부하지만 배경 통제 불가
- `roundish_flat` — 둥글고 부드러운 느낌, Kurzgesagt에 가까울 수 있음
- `segmented_colors` — 색상 영역이 구분된 스타일
- `vivid_shapes` — 선명한 형태
- substyle 없이 (모델 자체 판단)

### 3. QA는 Recraft 생성 + Claude 채점

**결정**: 생성은 Recraft, 채점은 Claude Vision

**이유**:
- 이전 실험에서 Claude가 자기 생성물을 채점하면 self-bias 발생 우려
- Recraft 생성 + Claude 채점이면 더 객관적
- Claude Vision으로 PNG 이미지를 직접 분석 (SVG 코드 분석이 아닌 실제 시각 분석)

## Risks / Trade-offs

**[커스텀 스타일 품질 불확실]** → reference 이미지 품질에 크게 의존. 좋은 reference를 확보하는 게 핵심.

**[Recraft 크레딧 소진]** → 현재 3000 크레딧. 탐색(~20) + 배치(30) + 재생성(~10) = ~60 호출. 충분.

**[배경 통제 여전히 안 될 수 있음]** → create_style이 배경까지 학습하는지 확인 필요. 안 되면 `remove_background` + `replace_background` MCP 도구로 후처리.

**[substyle과 styleID 충돌]** → Recraft API에서 style과 styleID는 상호배타. styleID 사용 시 substyle 지정 불가. styleID만으로 충분한지 확인 필요.
