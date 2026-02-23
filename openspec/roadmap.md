# 금융 교육 애니메이션 자동화 로드맵

## 비전

금융 교육 영상 제작을 자동화한다.
**에셋은 사고, 연출은 학습한다.**
수급된 에셋을 Remotion 장면 엔진으로 조합하고, 레퍼런스 영상에서 학습한 연출 패턴을 축적하여 점진적으로 자동화 비율을 높인다.

### 핵심 원칙

1. **에셋은 사고, 연출은 학습한다** — 에셋 자동 생성에 매몰되지 않고, 연출 패턴 축적에 집중
2. **Human-in-the-Loop** — AI가 초안, 사람이 검수/수정, 수정이 다시 학습에 반영
3. **Progressive Automation** — 초기에는 사람 개입이 많고, 패턴이 쌓일수록 자동화 비율 증가
4. **Remotion 중심, AE 보조** — 자동화 파이프라인은 Remotion으로 완결, AE는 필요한 장면만
5. **이징과 타이밍이 퀄리티를 결정** — 에셋 퀄리티 이전에, 모션 퀄리티가 PPT와 모션그래픽을 가른다

---

## 방향 전환 이력 (2026-02-24)

### 이전 방향 (Tier 구조)

에셋 자동 생성·리깅에 집중:
- Tier 1: 에셋 생성 파이프라인 (Recraft style_id, 캐릭터 리깅, SVG→Lottie)
- Tier 2: 애니메이션 제작 (에셋+프리셋 조합)
- Tier 3: 자기 발전 파이프라인 (영상 분석→프리셋 확장)

### 전환 이유

1. **2D 에셋 자동 생성의 현실적 한계** — 그림체 통일, 파츠 분리, 자동 리깅 모두 미성숙. 투자 대비 성과 불확실
2. **ROI 재계산** — 에셋 확보는 1회성 투자, 장면 구성+애니메이션은 매 영상마다 반복 비용(5~8시간). 반복 비용 자동화가 압도적 ROI
3. **이징/타이밍이 퀄리티 결정** — PPT vs 모션그래픽의 차이는 에셋이 아니라 이징 커브, 등장 타이밍, 나레이션 싱크

### 이전 실험에서 확보한 자산 (계속 활용)

| 항목 | 상태 | 활용 계획 |
|------|------|----------|
| Recraft style_id 파이프라인 | ✅ 검증 완료 | 아이콘/소품 수급 보조 |
| SVG→Lottie 변환 + 모션 프리셋 6종 | ✅ 완료 | 수급 에셋에 모션 적용 |
| Lottie 해부/리스킨 도구 | ✅ 완료 | 에셋 색상 변주용 |
| 에셋 검수 UI (AssetReview) | ✅ 완료 | 패턴 승인 UI로 확장 가능 |
| 캐릭터 리깅 분석 (10-layer 뼈대) | ✅ 참고용 | AE 연동 시 활용 |

---

## 현재 보유 자산

| 영역 | 상태 |
|------|------|
| 엔진 | Remotion 기반, 컴포넌트 20종, 전환 8종, 프리셋 13종 |
| 레이아웃 | 6종 (Center, Split, TopBottom, Grid, Focus, FullScreen) |
| 에셋 | Lottie 45개 (톤앤매너 제각각), Recraft 아이콘 30종 |
| 패럴랙스 | ParallaxScene 구현 완료 |
| 이펙트 | FloatingParticles, GradientOrb, GeometricDecor, Spotlight |
| 씬 컴포저 | 규칙 기반 + LLM 보조 조합 |
| 에셋 매칭 | asset-matcher.ts (키워드 기반, 45개 등록) |
| 모션 프리셋 | 6종 (float, bounce, rotate, pulse, swing, fade_in) |

---

## 에셋 수급 전략 (구매 중심)

| 에셋 유형 | 수급 방법 | 비고 |
|-----------|----------|------|
| 캐릭터 | Freepik, Creative Market 등 creation kit 구매 (2~3종) | 파츠 분리된 kit 선택 |
| 배경 | AI 생성 또는 에셋 마켓 구매 | 정적이라 난이도 낮음 |
| 아이콘/소품 | SVG 에셋 마켓 + Recraft 보조 생성 | 풍부하게 존재 |
| 이펙트 | LottieFiles에서 수급 | 기존 45개 + 추가 수급 |
| 차트/다이어그램/숫자 | 코드로 직접 생성 (Remotion 컴포넌트) | AnimatedLineChart, CountUpNumber 등 |
| 리컬러링 | 확보된 에셋의 색상 변경으로 베리에이션 | reskin-lottie.ts 활용 |

---

## 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| 영상 렌더링 엔진 | **Remotion** (React + TypeScript) | 장면 구성, 전환, 애니메이션, MP4 출력 |
| 에셋 포맷 | **SVG** (정적), **Lottie** (애니메이션) | 에셋 저장/재생 |
| 나레이션 | **ElevenLabs API** (TTS) | 음성 생성 |
| 장면 구성 AI | **Claude/GPT** (LLM) | 스크립트 → Scene JSON |
| 영상 분석 | **Claude Vision API** | 프레임 → 패턴 추출 |
| 영상 다운로드/처리 | **yt-dlp** + **ffmpeg** | 영상 분석용 프레임 추출 |
| 세밀 조정 (선택) | **After Effects** + ExtendScript | 특수 장면 수정 |
| 패키지 매니저 | **pnpm** | 의존성 관리 |

### 역할 분담: Remotion vs Lottie vs SVG

| 기술 | 역할 | 설명 |
|------|------|------|
| **Remotion** | 장면 엔진 | 레이아웃, 타이밍, 전환, 동적 제어, 나레이션 싱크. 영상의 "연출" 전부 |
| **Lottie** | 에셋 포맷 | 개별 에셋의 자체 애니메이션 (캐릭터 모션, 이펙트 루프 등) |
| **SVG** | 정적 에셋 | 배경, 아이콘. Remotion이 직접 animate할 대상 |

### 대안 도구 검토 결과

| 도구 | 장점 | 단점 | 결론 |
|------|------|------|------|
| Motion Canvas | 애니메이션 작성이 직관적 | MP4 렌더링/오디오 싱크 미지원 | 교육 영상에는 부적합 |
| Revideo (MC 포크) | Motion Canvas + 오디오/렌더링 | 생태계 미성숙 | 유망하지만 아직 이름 |
| Twick | JSON 타임라인, AI 친화적 | 생태계 미성숙 | 모니터링 대상 |
| AE (ExtendScript) | 프리셋/생태계 최강 | GUI 프로세스 필요, headless 불가 | 보조 도구로 활용 |

---

## Phase 1: Remotion 장면 엔진 ← 지금

**목표**: Remotion 핵심 시스템 구현. 더미 Scene JSON으로 "PPT가 아닌 모션그래픽" 퀄리티 검증

### 1-A. Theme 시스템

- colors, typography, motion (이징 커브 포함)
- 이징 프리셋: `KURZGESAGT = bezier(0.32, 0, 0.15, 1)`, SNAP, GENTLE 등

### 1-B. Animation System

- AnimationWrapper: enter/during/exit 3단계 애니메이션
- 이징 프리셋 적용
- 커스텀 이징 커브 지원

### 1-C. Transition Components (7종)

- Fade, ColorWipe, ZoomIn/Out, SlideUp, WipeLeft, CrossDissolve
- 나레이션 싱크와 연동

### 1-D. Layout Components (6종)

- Center, Split, TopBottom, Grid, FullScreen, Focus
- Safe Zone 내 자동 배치

### 1-E. Finance Components

- AnimatedLineChart (stroke-dashoffset 선 그리기)
- CountUpNumber (0→목표 카운팅)
- ComparisonTable
- 기타 금융 교육 특화 컴포넌트

### 1-F. SceneRenderer

- Scene JSON → React 컴포넌트 트리 변환
- 프리셋 DB 기반 장면 렌더링

### Phase 1 성공 기준

| 항목 | 목표 |
|------|------|
| Theme 시스템 | 이징 프리셋 3종+, 색상/타이포 정의 |
| 전환 | 7종 구현, 프레임 단위 제어 |
| 레이아웃 | 6종 구현, 에셋 자동 배치 |
| 데모 영상 | 더미 Scene JSON → 30초 샘플 MP4, "모션그래픽" 느낌 |

---

## Phase 2: 영상 분석 + 패턴 축적 ← 다음

**목표**: 레퍼런스 영상(쿠르츠게작트 + 금융 교육 10편)에서 연출 패턴 20~30종 축적

### 2-A. 프레임 추출 파이프라인

```
유튜브 영상 URL → yt-dlp 다운로드 → ffmpeg 장면 전환 감지
→ 전환 지점 기준 장면 분리 → 대표 프레임 + 연속 프레임 추출
```

### 2-B. Claude Vision 분석기

각 장면에 대해 분석:
- 레이아웃 (중앙배치? 좌우분할? 그리드?)
- 색상 팔레트 (배경색, 강조색, 텍스트색)
- 요소 종류 (차트, 텍스트, 아이콘, 캐릭터)
- 전환 종류 (연속 프레임 비교: fade? wipe? zoom?)
- 등장 방향/순서 (연속 프레임 분석)

### 2-C. 패턴 승인 UI

분석 결과를 사람에게 제시 → 승인/수정/스킵:

```
"장면 #3 (0:42~0:58)"
[대표 프레임 이미지]

분석 결과:
  - 레이아웃: SplitLayout (40:60)
  - 배경: 단색 다크블루
  - 전환 IN: color_wipe
  - 전환 OUT: zoom_in

→ [승인] [수정] [스킵]
```

### 2-D. 데모 생성기

승인된 패턴 → Remotion 프리뷰 자동 생성 (더미 텍스트 + 더미 에셋):
- 사람이 확인: "이 느낌이 맞다" → 최종 등록
- 타이밍/이징 미세 조정 → 수정 후 등록

### 2-E. 프리셋 DB

```json
{
  "id": "explain_split_v1",
  "source": "kurzgesagt_compound_interest_0:42",
  "type": "explain",
  "tags": ["개념설명", "캐릭터+텍스트", "split"],
  "layout": "SplitLayout",
  "elementSlots": [...],
  "transition": { "enter": {...}, "exit": {...} },
  "timing": { "elementStagger": 6, "afterNarrationStart": 9 },
  "easing": "KURZGESAGT"
}
```

장면 유형별 목표:
- intro (타이틀) 3~5종
- explain (개념 설명) 5~8종
- chart (데이터 시각화) 3~5종
- comparison (비교) 3~5종
- callout (핵심 메시지) 3~5종
- outro (엔딩) 2~3종

### Phase 2 성공 기준

| 항목 | 목표 |
|------|------|
| 분석 영상 | 10편+ |
| 프리셋 축적 | 20~30종 |
| 데모 검증 | 승인된 패턴의 Remotion 재현 확인 |

---

## Phase 3: LLM Scene Composer ← 그다음

**목표**: 스크립트 텍스트 입력 → Scene JSON 자동 생성

### 3-A. 시스템 프롬프트

- 프리셋 DB + 규칙 + 에셋 레지스트리를 프롬프트에 주입
- Few-shot 예시 10~20개 (축적된 패턴 기반)

### 3-B. 스크립트 → Scene JSON 파이프라인

```
스크립트 텍스트 입력
→ LLM이 프리셋 DB 참조하여 판단:
  "이 문단은 '개념 설명' → explain_split_v1 프리셋"
  "이 문단은 '수치 비교' → chart_center_v2 프리셋"
→ 장면별 Scene JSON + 필요 에셋 리스트 + 타이밍 계획
→ 사람 검수/수정
```

### 3-C. Validator

- Scene JSON 검증 규칙 (필수 필드, 에셋 존재 여부, 타이밍 충돌 등)

### Phase 3 성공 기준

| 항목 | 목표 |
|------|------|
| Scene JSON 생성 | 스크립트 1편 → 10~15장면 자동 생성 |
| 사람 수정률 | 30% 이하 (70%는 그대로 사용 가능) |
| 에셋 매칭 | 자동 매칭 정확도 80%+ |

---

## Phase 4: AE 연동 (필요 시)

**목표**: 특수 장면만 AE로 넘겨 사람이 수정, 최종 합본

### 연동 구조

```
평소 (자동): 스크립트 → Scene JSON → Remotion → MP4

특수 장면 (반자동):
  Scene JSON → ExtendScript로 AE 프로젝트 자동 생성
  → 사람이 AE에서 해당 장면만 수정
  → Lottie/영상 클립으로 내보내기
  → Remotion 최종 합본
```

### AE로 넘기는 기준

| Remotion으로 충분 | AE가 필요 |
|------------------|----------|
| 차트 애니메이션 | 캐릭터 복잡한 모션 |
| 텍스트 등장/퇴장 | 모션 블러, 글로우 등 픽셀 이펙트 |
| 화면 전환 | Duik IK 리깅이 필요한 경우 |
| 레이아웃 배치, 색상 변화, 숫자 카운팅 | 파티클, 특수 이펙트 |

### 구현 항목

1. Scene JSON → AE 프로젝트 변환 (ExtendScript)
2. AE → Lottie/영상 클립 내보내기 자동화
3. Remotion 합본 파이프라인

---

## Phase 5: 피드백 루프

**목표**: 사람의 수정 내역을 축적하여 프리셋과 규칙을 지속 개선

### 수정 내역 분석

```
"SplitLayout에서 캐릭터 크기를 항상 줄임"
→ 기본 캐릭터 크기 프리셋 하향 조정

"zoom_in 전환을 fade로 자주 바꿈"
→ 해당 장면 유형의 기본 전환 변경

"차트 등장을 항상 0.5초 늦춤"
→ afterNarrationStart 값 조정
```

### 구현 항목

1. 수정 내역 로깅 (JSON diff 기록)
2. 패턴 분석 (수정 빈도 높은 항목 자동 감지)
3. 프리셋 자동 업데이트 제안

---

## 우선순위 요약

```
[지금]   Phase 1: Remotion 장면 엔진 (Theme, Animation, Transition, Layout, SceneRenderer)
[다음]   Phase 2: 영상 분석 + 패턴 축적 (20~30종 프리셋 DB)
[그다음] Phase 3: LLM Scene Composer (스크립트 → Scene JSON)
[필요시] Phase 4: AE 연동 (특수 장면만)
[지속]   Phase 5: 피드백 루프 (수정 → 프리셋 개선)
```

ROI: 장면 엔진 > 패턴 축적 > LLM 컴포저 > AE 연동

---

## 아카이브: 이전 에셋 실험

> 아래는 방향 전환 이전에 수행한 실험 기록이다. 결과물(도구, 에셋)은 계속 활용한다.

### 실험 A: 에셋 생성 API 비교

> 상세: `changes/asset-pipeline-validation/`

- Recraft V3 > Claude SVG > GPT Image (품질)
- Claude SVG: 수치적으로 통과하나 시각적으로 단순
- Recraft: 시각적 풍부, 배경 통제가 과제

### 실험 B: Recraft 커스텀 스타일

> 상세: `changes/recraft-style-pipeline/`

- create_style + style_id로 일관성 확보
- 30종 production 아이콘 확보
- Human-First Calibration 채점 체계

### 실험 C: 캐릭터 리깅 POC

> 상세: `changes/recraft-style-pipeline/character-poc.md`

- SVG→Lottie 변환, 모션 프리셋 6종, 리스킨 도구 완성
- 부위 분리(파츠 세그먼테이션)가 핵심 병목 → **방향 전환의 직접적 계기**
- Vision 라벨링 준비까지 진행 후 중단
