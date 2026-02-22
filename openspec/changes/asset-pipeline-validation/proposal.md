## Why

엔진, 프리셋, 빌더 모두 구현 완료. **병목은 에셋이다.**

현재 Lottie 에셋 45+개가 레지스트리에 있지만, 금융 교육에 필요한 아이콘 세트가 부족하다. 수동 제작은 느리고 비용이 높으므로, 이미지 생성 API로 아이콘 에셋을 자동 생성할 수 있는 파이프라인을 검증하고, **실제 production 에셋도 확보**한다.

핵심 질문 3가지:
1. **어떤 API가 제일 나은가?** — Recraft V3 / GPT Image / Claude SVG 중 아이콘 에셋에 최적인 API 선정
2. **스타일 통일이 가능한가?** — reference 이미지 기반으로 새 에셋을 생성했을 때 일관성이 유지되는지
3. **배치 생성 + 자동 QA가 실용적인가?** — 30개 아이콘을 배치 생성하고 Vision QA로 자동 검수하여 production 에셋 확보

## What Changes

- **experiment/ 디렉토리 신규 생성**: 실험 코드, 결과 데이터, 생성 에셋을 격리하여 관리
- **3단계 순차 실험**: A(API 비교) → B(Reference 수렴) → C(배치 생성+QA)
- **production 에셋 산출물**: QA 통과한 아이콘 PNG를 실제 엔진에 투입 가능한 형태로 확보
- **(부록) 프레임 분석**: 프리셋 확장 시 활용할 영상 프레임 분석은 후순위로 대기

## Capabilities

### New Capabilities
- `api-comparison`: 동일 프롬프트로 3개 API를 비교하여 아이콘 생성 최적 API 선정
- `reference-convergence`: reference 이미지 기반 스타일 수렴 — 새 에셋이 기존 세트와 일관된 스타일을 유지하는지 검증
- `batch-generation-qa`: 확정된 파이프라인으로 30개 production 아이콘 배치 생성 + Vision QA 자동 검수 + 일관성 최종 검수
- `frame-analysis` (부록): 영상 프레임에서 프리셋 JSON 자동 추출 — 프리셋 확장 시 활용

### Modified Capabilities
- 기존 `src/composer/asset-matcher.ts`의 에셋 레지스트리에 새 아이콘 추가 예정

## Impact

- **신규 생성**: `experiment/` 디렉토리 전체
- **산출물**: `experiment/outputs/production/` — QA 통과한 PNG 아이콘 세트 (최대 30개)
- **향후 수정 대상**: `src/composer/asset-matcher.ts` — production 아이콘을 에셋 레지스트리에 등록
- **참조만**: `src/theme/colors.ts`, `src/types/index.ts`
- **환경 요구사항**:
  | 항목 | 필수/선택 | 용도 |
  |------|---------|------|
  | ANTHROPIC_API_KEY | 필수 | Claude SVG (A), Vision QA (C) |
  | OPENAI_API_KEY | 선택 | GPT Image (A, B, C) |
  | RECRAFT_API_KEY | 선택 | Recraft V3 (A, B) |
  | yt-dlp + ffmpeg | 선택 | 부록 실험 D만 |
- **비용 추정**: API 비용 $5~15, 시간 3~4시간
