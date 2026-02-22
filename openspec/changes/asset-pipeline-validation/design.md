## Context

### 현재 상태
금융 교육 애니메이션 엔진은 스크립트 → 영상 파이프라인이 완성된 상태다:
- Composer (규칙+LLM 듀얼 엔진)으로 장면 자동 구성
- 20+ React 컴포넌트, 13 애니메이션 프리셋, 9 전환, 3 카메라 모션
- Builder UI로 시각 편집
- 45+ Lottie 에셋 레지스트리 (한/영 태그 매칭)

**병목**: 아이콘 에셋이 부족하다. 금융 교육에 필요한 개념(이자율, 저축, 투자, 리스크 등)을 표현할 플랫 벡터 아이콘이 없어서 영상 제작이 막혀있다.

### 목표 파이프라인
```
실험 A: API 탐색          →  어떤 API가 제일 나은지 확인
실험 B: Reference 수렴     →  레퍼런스 기반으로 스타일 통일 가능한지 검증
실험 C: 배치 생성 + QA     →  확정된 스타일로 에셋 세트 생성 + 자동 검수
                               ↓
                       production/ 에 QA 통과 에셋 확보
                               ↓
                       asset-matcher.ts 레지스트리에 등록
```

### 기술 스택
- Runtime: Node.js + TypeScript (ts-node)
- AI: @anthropic-ai/sdk (Vision QA), openai SDK (GPT Image), Recraft API
- 렌더링: Remotion

## Goals / Non-Goals

**Goals:**
- 아이콘 생성에 가장 적합한 API를 실증적으로 선정한다
- reference 이미지 기반 스타일 수렴이 가능한지 검증한다
- **실제 사용 가능한 production 아이콘 세트(30개)를 확보한다**
- Vision QA 자동 검수의 실용성을 검증한다

**Non-Goals:**
- 배경/캐릭터 에셋 생성 (이번 실험은 아이콘에만 집중)
- 프레임 분석 → 프리셋 자동 추출 (부록으로 후순위)
- 기존 src/ 코드 변경 (에셋 레지스트리 등록은 실험 후 별도)
- Lottie 애니메이션 변환 (PNG 아이콘만 다룸)

## Decisions

### 1. 실험 순서: A → B → C 순차 진행

**결정**: API 비교(A) → Reference 수렴(B) → 배치 생성(C) 순서

**이유**:
- A에서 1등 API를 선택해야 B에서 그 API로 reference 수렴을 테스트할 수 있음
- B에서 스타일 통일이 확인되어야 C에서 30개를 배치 생성하는 의미가 있음
- 각 단계가 이전 단계의 결과에 의존하는 순차 파이프라인

**대안 고려**:
- 3개 API 전부 B까지 진행: 비용 3배, 시간 3배. A에서 충분히 걸러짐

### 2. 아이콘 중심 실험

**결정**: 배경/캐릭터가 아닌 아이콘(512~1024px)에만 집중

**이유**:
- 아이콘이 가장 많이 필요한 에셋 유형 (30개 목록 정의됨)
- 작은 사이즈에서 품질 검증이 더 쉽고 비용도 적음
- 배경은 기존 Lottie로 커버 가능, 아이콘이 진짜 부족한 부분

### 3. 스타일 기준: STYLE_PREFIX 통일

**결정**: 모든 프롬프트에 공통 스타일 프리픽스 사용

```
Flat vector icon, Kurzgesagt animation style.
Dark navy background (#1B2838). Simple geometric shapes, no outlines, no text.
Soft glow effect. Clean and minimal. Suitable for motion graphics overlay.
```

**이유**:
- 일관된 스타일 지시로 API 간 공정 비교
- hex 색상값 명시로 색상 정확도 측정 가능
- "no outlines, no text" 명시로 Kurzgesagt 스타일 핵심 특성 강제

### 4. QA 합격 기준: 50점 만점 중 38점

**결정**: 10개 항목 × 5점 = 50점 만점, 38점(76%) 이상 Pass

**이유**:
- 실험 B에서 reference 수렴이 된 상태이므로 기준을 이전(35점)보다 올림
- 76%면 "대부분 좋지만 1-2가지 작은 문제"까지 허용
- production 에셋이므로 이전 feasibility 테스트보다 엄격해야 함

### 5. Reference 수렴 방식: Vision 스타일 추출 → 프롬프트 삽입

**결정**: reference 이미지를 Vision으로 분석하여 스타일 설명을 추출하고, 그 설명을 생성 프롬프트에 삽입

**이유**:
- GPT Image는 직접 reference 이미지를 입력받지 않음
- Vision으로 추출한 스타일 설명이 텍스트 프롬프트로 전달 가능
- Recraft는 style_id로 커스텀 스타일 등록 가능 (대안)

**대안 고려**:
- Recraft style_id: API 키가 있으면 더 정확할 수 있으나, reference 이미지 업로드 필요
- 수동 스타일 가이드 작성: 사람이 직접 쓰면 정확하지만 자동화 취지에 반함

### 6. 프레임 분석은 부록으로

**결정**: 실험 D(프레임 분석 → 프리셋)는 부록으로 후순위 처리

**이유**:
- 프리셋은 이미 구현 완료. 지금 병목은 에셋이지 프리셋이 아님
- 프레임 분석은 프리셋을 확장할 때 비로소 가치가 있음
- 에셋 파이프라인 검증이 더 긴급한 비즈니스 임팩트

## Risks / Trade-offs

**[API 키 부재로 비교 불완전]** → 최소 ANTHROPIC_API_KEY만 있으면 Claude SVG로 실험 A 진행 가능. 2개 이상 API를 비교해야 의미 있는 결과.

**[Reference 수렴 실패 (B 실패)]** → 일관성 점수 25~34면 프롬프트 조정 후 재시도. 24 이하면 해당 API/방식에 한계가 있으므로 대안 검토 (Recraft style_id, 수동 스타일 가이드 등).

**[배치 생성 시 QA 통과율 저조]** → 통과율 70% 미만이면 프롬프트 튜닝 또는 reference 재선정. 실패한 에셋은 fix_suggestions를 반영하여 재생성.

**[비용 초과]** → 30개 아이콘 × 3단계 = ~90 API 호출. GPT Image 기준 ~$10, Recraft ~$5, Claude Vision QA ~$3. 총 $15 이내.

**[투명 배경 미지원]** → Claude SVG는 본질적으로 투명 배경. GPT Image는 transparent 옵션 있음. Recraft는 별도 처리 필요할 수 있음.
