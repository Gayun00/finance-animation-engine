# Scene Composition & Layout System — 상세 설계

스크립트가 주어졌을 때, 각 장면을 **어떻게 구성하고**, **어떤 전환을 쓰고**, **에셋을 어디에 배치할지**를 결정하는 시스템.

---

## 1. 장면 구성 규칙 (Scene Composition Rules)

### 1.1 스크립트 섹션 → 장면 유형 매핑

스크립트의 `## section` 타입에 따라 기본 장면 구성이 결정된다.

| Section Type | 기본 레이아웃 | 주요 컴포넌트 | 설명 |
|-------------|-------------|-------------|------|
| `intro` | FullScreen | `TitleCard` | 제목 + 부제목, 배경 에셋 |
| `explain` | SplitLayout | `Character` + 설명 요소 | 캐릭터가 왼쪽, 설명이 오른쪽 |
| `chart` | CenterLayout | 차트 컴포넌트 + 라벨 | 차트가 중앙, 라벨 상단 |
| `comparison` | SplitLayout | `ComparisonTable` | A vs B 좌우 비교 |
| `callout` | CenterLayout | `CalloutBox` + `Spotlight` | 핵심 메시지 강조 |
| `outro` | FullScreen | `EndCard` | 채널명 + CTA |

### 1.2 장면 구성 의사결정 플로우

```
스크립트 섹션 입력
    │
    ├─ 섹션 타입 확인 (intro/explain/chart/...)
    │
    ├─ @directive 파싱 (@chart, @compare 등)
    │   └─ directive가 있으면 → 해당 컴포넌트 강제 사용
    │
    ├─ 나레이션 길이 확인
    │   ├─ 5초 미만 → 요소 1~2개 (단순 구성)
    │   ├─ 5~15초 → 요소 2~3개 (표준 구성)
    │   └─ 15초 이상 → 요소 3~5개 (단계적 등장)
    │
    ├─ 레이아웃 프리셋 선택
    │
    └─ 에셋 매칭 (태그 기반 검색)
        └─ 나레이션 키워드 → 에셋 레지스트리 태그 매칭
```

### 1.3 Scene Composer LLM 프롬프트 구조

```
[System Prompt]
You are a motion graphics director for financial education videos
in Kurzgesagt style.

[Context]
- Available layouts: {layout_presets}
- Available components: {component_registry}
- Available assets: {asset_registry}
- Available transitions: {transition_presets}
- Color palette: {COLORS}
- Motion rules: {MOTION}

[Rules]
1. 장면 duration은 반드시 나레이션 duration과 일치
2. 기본 이징: KURZGESAGT_EASE [0.32, 0, 0.15, 1]
3. 화면이 0.5초 이상 비어있으면 안 됨
4. 동시 등장 최대 3개
5. 한 장면 최대 5개 요소
6. 차트 애니메이션은 나레이션에서 데이터 언급 후 0.3초 뒤 시작
7. 같은 전환을 연속 2번 사용하지 않음
8. 이전 장면의 마지막 요소와 다음 장면의 첫 요소가 시각적으로 연결되어야 함

[Few-shot Examples]
{examples_json}

[Input]
Section: {section}
Narration: "{narration_text}"
Duration: {duration_seconds}s
Previous scene transition: {prev_transition}

[Output Format]
{scene_json_schema}
```

### 1.4 Few-shot 예시 (10종)

```json
[
  {
    "input": {
      "type": "intro",
      "narration": "여러분, 아인슈타인이 세계 8번째 불가사의라고 불렀던 것이 뭔지 아시나요?",
      "duration": 5.2
    },
    "output": {
      "layout": "FullScreen",
      "background": { "type": "gradient", "from": "#0F1923", "to": "#1B2838", "angle": 180 },
      "elements": [
        {
          "component": "TitleCard",
          "props": { "title": "복리의 마법", "subtitle": "The Magic of Compound Interest" },
          "position": { "x": 960, "y": 540 },
          "enterAt": 0,
          "animation": { "enter": { "type": "scale_in", "durationInFrames": 18, "easing": "BOUNCE_IN" } }
        },
        {
          "component": "FloatingIcons",
          "props": { "icons": ["icon_money_stack", "icon_coin", "icon_chart_up"], "speed": 0.5 },
          "position": { "x": 960, "y": 540 },
          "enterAt": 6,
          "animation": { "enter": { "type": "fade_in", "durationInFrames": 15 } }
        }
      ],
      "transition": { "type": "color_wipe", "color": "#4FC3F7", "durationInFrames": 15 }
    }
  },
  {
    "input": {
      "type": "explain",
      "narration": "단리는 원금에만 이자가 붙습니다. 1000만원을 연 5%로 10년 넣으면, 매년 50만원씩, 총 500만원의 이자를 받죠.",
      "duration": 10.5
    },
    "output": {
      "layout": "SplitLayout",
      "layoutProps": { "ratio": 0.4 },
      "background": { "type": "solid", "color": "#1B2838" },
      "elements": [
        {
          "component": "Character",
          "props": { "assetId": "char_person_01", "pose": "explaining", "emotion": "neutral" },
          "position": { "x": 350, "y": 600 },
          "enterAt": 0,
          "animation": { "enter": { "type": "slide_in", "direction": "left", "durationInFrames": 12 } }
        },
        {
          "component": "CountUpNumber",
          "props": { "from": 0, "to": 1000, "suffix": "만원", "prefix": "원금 " },
          "position": { "x": 1200, "y": 300 },
          "enterAt": 9,
          "animation": { "enter": { "type": "scale_in", "durationInFrames": 12 } }
        },
        {
          "component": "AnimatedLineChart",
          "props": {
            "data": [
              { "year": 0, "value": 1000 }, { "year": 5, "value": 1250 }, { "year": 10, "value": 1500 }
            ],
            "color": "#90A4AE",
            "strokeWidth": 3,
            "drawDuration": 30
          },
          "position": { "x": 1200, "y": 550 },
          "enterAt": 60,
          "animation": { "enter": { "type": "draw_line", "durationInFrames": 30 } }
        },
        {
          "component": "CountUpNumber",
          "props": { "from": 0, "to": 500, "suffix": "만원", "prefix": "이자 " },
          "position": { "x": 1200, "y": 800 },
          "enterAt": 210,
          "animation": {
            "enter": { "type": "bounce_in", "durationInFrames": 15 },
            "during": { "type": "pulse", "durationInFrames": 30 }
          }
        }
      ],
      "transition": { "type": "zoom_in", "durationInFrames": 15 }
    }
  },
  {
    "input": {
      "type": "chart",
      "narration": "30년간 복리와 단리의 차이를 그래프로 확인해보겠습니다.",
      "duration": 8.0,
      "directive": { "type": "chart", "params": { "type": "compound_vs_simple", "principal": 1000, "rate": 5, "years": 30 } }
    },
    "output": {
      "layout": "CenterLayout",
      "background": { "type": "solid", "color": "#0F1923" },
      "elements": [
        {
          "component": "CompoundInterestChart",
          "props": { "rate": 5, "years": 30, "principal": 1000, "compareSingle": true },
          "position": { "x": 960, "y": 500 },
          "enterAt": 9,
          "animation": { "enter": { "type": "draw_line", "durationInFrames": 45 } }
        },
        {
          "component": "CalloutBox",
          "props": { "text": "복리 vs 단리 30년 비교", "type": "info" },
          "position": { "x": 960, "y": 120 },
          "enterAt": 0,
          "animation": { "enter": { "type": "fade_in", "durationInFrames": 10 } }
        }
      ],
      "transition": { "type": "fade", "durationInFrames": 12 }
    }
  },
  {
    "input": {
      "type": "comparison",
      "narration": "30년 후 최종 금액을 비교해보면, 단리는 2500만원, 복리는 4322만원입니다.",
      "duration": 7.0,
      "directive": { "type": "compare", "params": { "A": "단리 30년", "B": "복리 30년", "metric": "최종금액" } }
    },
    "output": {
      "layout": "SplitLayout",
      "layoutProps": { "ratio": 0.5 },
      "background": { "type": "gradient", "from": "#1B2838", "to": "#0F1923", "angle": 90 },
      "elements": [
        {
          "component": "ComparisonTable",
          "props": {
            "items": [
              { "label": "단리 30년", "value": "2,500만원", "color": "#90A4AE" },
              { "label": "복리 30년", "value": "4,322만원", "color": "#81C784" }
            ],
            "highlightWinner": true
          },
          "position": { "x": 960, "y": 450 },
          "enterAt": 9,
          "animation": { "enter": { "type": "slide_in", "direction": "up", "durationInFrames": 15 } }
        },
        {
          "component": "CountUpNumber",
          "props": { "from": 0, "to": 1822, "suffix": "만원", "prefix": "차이 " },
          "position": { "x": 960, "y": 750 },
          "enterAt": 120,
          "animation": {
            "enter": { "type": "bounce_in", "durationInFrames": 15 },
            "during": { "type": "pulse", "durationInFrames": 24 }
          }
        }
      ],
      "transition": { "type": "color_wipe", "color": "#81C784", "durationInFrames": 15 }
    }
  },
  {
    "input": {
      "type": "callout",
      "narration": "복리의 핵심은 시간입니다. 일찍 시작할수록 기하급수적으로 커집니다.",
      "duration": 6.0
    },
    "output": {
      "layout": "CenterLayout",
      "background": { "type": "solid", "color": "#1E3A5F" },
      "elements": [
        {
          "component": "Spotlight",
          "props": { "x": 960, "y": 400, "radius": 300, "dimOpacity": 0.7 },
          "position": { "x": 960, "y": 540 },
          "enterAt": 0,
          "animation": { "enter": { "type": "fade_in", "durationInFrames": 12 } }
        },
        {
          "component": "CalloutBox",
          "props": { "text": "복리의 핵심 = 시간", "icon": "icon_clock", "type": "highlight" },
          "position": { "x": 960, "y": 400 },
          "enterAt": 9,
          "animation": { "enter": { "type": "scale_in", "durationInFrames": 15, "easing": "BOUNCE_IN" } }
        },
        {
          "component": "GlowPulse",
          "props": { "color": "#FFD54F", "intensity": 0.6, "frequency": 2 },
          "position": { "x": 960, "y": 400 },
          "enterAt": 24,
          "animation": { "enter": { "type": "fade_in", "durationInFrames": 10 } }
        }
      ],
      "transition": { "type": "zoom_out", "durationInFrames": 18 }
    }
  },
  {
    "input": {
      "type": "outro",
      "narration": "오늘부터 복리의 마법을 시작해보세요. 구독과 좋아요, 부탁드립니다.",
      "duration": 5.0
    },
    "output": {
      "layout": "FullScreen",
      "background": { "type": "gradient", "from": "#0F1923", "to": "#1B2838", "angle": 0 },
      "elements": [
        {
          "component": "EndCard",
          "props": { "channelName": "금융의 정석", "subscribeText": "구독과 좋아요" },
          "position": { "x": 960, "y": 540 },
          "enterAt": 0,
          "animation": { "enter": { "type": "scale_in", "durationInFrames": 18, "easing": "KURZGESAGT" } }
        },
        {
          "component": "ParticlePop",
          "props": { "count": 20, "colors": ["#4FC3F7", "#FFD54F", "#81C784"], "spread": 400 },
          "position": { "x": 960, "y": 540 },
          "enterAt": 15,
          "animation": { "enter": { "type": "fade_in", "durationInFrames": 6 } }
        }
      ],
      "transition": null
    }
  }
]
```

---

## 2. 화면 전환 프리셋 (Transition Presets)

### 2.1 전환 컴포넌트 7종

각 전환은 독립 Remotion 컴포넌트로 구현. Scene 사이에 오버레이로 렌더링된다.

#### 1. Fade
```typescript
{ type: 'fade', durationInFrames: 12, easing: KURZGESAGT_EASE }
```

#### 2. Color Wipe (가장 쿠르츠게작트다운)
```typescript
{ type: 'color_wipe', color: '#4FC3F7', durationInFrames: 15, easing: KURZGESAGT_EASE }
```

#### 3. Zoom In
```typescript
{ type: 'zoom_in', durationInFrames: 18, easing: KURZGESAGT_EASE, focusPoint: { x: 960, y: 540 } }
```

#### 4. Zoom Out
```typescript
{ type: 'zoom_out', durationInFrames: 18, easing: SMOOTH_OUT }
```

#### 5. Slide Up
```typescript
{ type: 'slide_up', durationInFrames: 15, easing: KURZGESAGT_EASE }
```

#### 6. Wipe Left
```typescript
{ type: 'wipe_left', durationInFrames: 15, easing: KURZGESAGT_EASE }
```

#### 7. Cross Dissolve
```typescript
{ type: 'cross_dissolve', durationInFrames: 20, easing: SMOOTH_OUT }
```

### 2.2 전환 선택 규칙

```typescript
const TRANSITION_RULES = {
  defaults: {
    intro: null,
    explain: 'color_wipe',
    chart: 'zoom_in',
    comparison: 'slide_up',
    callout: 'zoom_in',
    outro: 'fade',
  },
  rules: [
    '같은 전환을 연속 2번 사용하지 않는다',
    'color_wipe의 컬러는 다음 장면의 주요 컬러와 일치시킨다',
    'zoom_in 후에는 zoom_out을 쓰면 자연스럽다',
    '감정적 전환(놀라움, 반전)에는 zoom_in + SNAP easing',
    '차분한 전환(요약, 마무리)에는 fade 또는 cross_dissolve',
  ],
  colorWipeColors: {
    profit: '#81C784',
    loss: '#E57373',
    info: '#4FC3F7',
    highlight: '#FFD54F',
    default: '#4FC3F7',
  }
};
```

### 2.3 전환 타이밍 규칙

```
|===== Scene A =====|==Trans==|===== Scene B =====|
                |exit|        |delay|enter|
```

---

## 3. 레이아웃 프리셋 (Layout Presets)

### 3.1 Safe Zone

```typescript
const SAFE_ZONE = {
  top: 100, bottom: 120, left: 100, right: 100,
  contentWidth: 1720,   // 1920 - 100 - 100
  contentHeight: 860,   // 1080 - 100 - 120
};
```

### 3.2 레이아웃 6종

1. **CenterLayout** — 단일/수직 스택 중앙 정렬
2. **SplitLayout** — 좌우 분할 (ratio 지정)
3. **TopBottomLayout** — 상하 분할
4. **GridLayout** — N열 그리드
5. **FullScreen** — 전체 화면 + 오버레이
6. **FocusLayout** — Spotlight 강조

### 3.3 레이아웃 선택 규칙

```typescript
const LAYOUT_SELECTION_RULES = {
  byType: {
    intro: 'FullScreen',
    explain: 'SplitLayout',
    chart: 'CenterLayout',
    comparison: 'SplitLayout',
    callout: 'FocusLayout',
    outro: 'FullScreen',
  },
  byElementCount: {
    1: 'CenterLayout',
    2: 'SplitLayout',
    '3+': 'GridLayout',
  },
  byDirective: {
    '@chart': 'CenterLayout',
    '@compare': 'SplitLayout',
    '@timeline': 'FullScreen',
    '@flow': 'CenterLayout',
  },
};
```

---

## 4. 에셋 배치 규칙 (Asset Placement)

### 4.1 요소 등장 순서

```typescript
const ELEMENT_ORDERING = {
  enterOrder: ['background', 'layout_frame', 'character', 'label', 'main_content', 'data', 'effect'],
  staggerDelay: 6,           // frames (0.2s)
  maxSimultaneous: 3,
  exitOrder: 'reverse',
  exitStartBeforeEnd: 15,    // frames (0.5s)
};
```

### 4.2 에셋 크기 규칙

```typescript
const ELEMENT_SIZING = {
  defaults: {
    character: { width: 400, height: 500 },
    chart: { width: 800, height: 500 },
    countUpNumber: { width: 400, height: 120 },
    calloutBox: { width: 600, height: 200 },
    comparisonTable: { width: 900, height: 400 },
    icon: { width: 120, height: 120 },
    titleCard: { width: 1200, height: 400 },
    endCard: { width: 1000, height: 600 },
  },
  maxSizeRatio: {
    CenterLayout: 0.7,
    SplitLayout: 0.9,
    GridLayout: 0.85,
    FullScreen: 0.8,
    FocusLayout: 0.5,
  },
};
```

---

## 5. 모션 프리셋 (Animation Presets)

### 5.1 Enter
| Preset | Duration | Easing | 용도 |
|--------|----------|--------|------|
| `scale_in` | 12f | KURZGESAGT | 범용 |
| `bounce_in` | 15f | BOUNCE_IN | 강조 |
| `slide_in` | 12f | KURZGESAGT | 순서 등장 |
| `fade_in` | 10f | SMOOTH_OUT | 부드러운 |
| `draw_line` | 30f | KURZGESAGT | 차트/도형 |
| `count_up` | 24f | KURZGESAGT | 숫자 |

### 5.2 During
| Preset | Duration | 용도 |
|--------|----------|------|
| `pulse` | 30f loop | 강조 유지 |
| `float` | 60f loop | 배경 요소 |
| `none` | - | 기본 |

### 5.3 Exit
| Preset | Duration | Easing |
|--------|----------|--------|
| `scale_out` | 9f | KURZGESAGT |
| `fade_out` | 9f | SMOOTH_OUT |
| `slide_out` | 9f | KURZGESAGT |

---

## 6. 구현 체크리스트

### Phase 2-A: 전환 컴포넌트
- [ ] ZoomTransition (in/out)
- [ ] SlideUpTransition
- [ ] CrossDissolveTransition
- [ ] 전환 선택 규칙 → Scene Composer 프롬프트 통합

### Phase 2-B: 레이아웃 컴포넌트
- [ ] SplitLayout
- [ ] TopBottomLayout
- [ ] GridLayout
- [ ] FocusLayout (Spotlight 연동)
- [ ] 레이아웃 내 자동 배치 로직

### Phase 2-C: Scene Composer 고도화
- [ ] LLM 시스템 프롬프트 작성
- [ ] Few-shot 예시 JSON 10~20개
- [ ] 전환/레이아웃 선택 규칙 통합
- [ ] 에셋 매칭 로직

### Phase 2-D: 통합 테스트
- [ ] 샘플 스크립트로 E2E 실행
- [ ] 장면 구성 검수
- [ ] 전환/레이아웃 미세 조정
