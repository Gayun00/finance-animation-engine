## ADDED Requirements

### Requirement: 공통 STYLE_PREFIX로 모든 프롬프트를 통일해야 한다

모든 API에 동일한 스타일 지시를 사용하여 공정한 비교를 보장한다.

#### Scenario: STYLE_PREFIX 정의
- **WHEN** 테스트 프롬프트를 작성할 때
- **THEN** 다음 프리픽스를 모든 프롬프트 앞에 붙인다:
  ```
  Flat vector icon, Kurzgesagt animation style.
  Dark navy background (#1B2838). Simple geometric shapes, no outlines, no text.
  Soft glow effect. Clean and minimal. Suitable for motion graphics overlay.
  ```
- **THEN** 각 아이콘별 고유 설명과 hex 색상값을 프리픽스 뒤에 추가한다

### Requirement: 5종 아이콘 프롬프트로 3개 API를 비교해야 한다

금융 교육에 필요한 대표 아이콘 5종을 테스트 세트로 사용한다.

#### Scenario: 테스트 아이콘 5종
- **WHEN** 비교 실험을 시작할 때
- **THEN** 다음 5종을 생성한다:
  1. `icon_gold_coin` — 금화 (gold #FFB74D, highlight #FFD54F)
  2. `icon_chart_up` — 상승 차트 (mint green #81C784, grid #2A4157)
  3. `icon_piggy_bank` — 저금통 (pink #F06292, coin slot #FFD54F)
  4. `icon_money_stack` — 지폐 묶음 (green #81C784, band #FFB74D)
  5. `icon_percent` — 상승 퍼센트 (cyan #4FC3F7, arrow #FFD54F)

### Requirement: Recraft V3로 벡터 아이콘을 생성해야 한다

#### Scenario: Recraft 생성
- **WHEN** RECRAFT_API_KEY가 설정되어 있을 때
- **THEN** `vector_illustration` style + `flat_2` substyle로 1024x1024 생성
- **THEN** 응답 URL에서 PNG 다운로드 → `outputs/round-a/{id}_recraft.png` 저장

#### Scenario: Recraft 키 미보유
- **WHEN** RECRAFT_API_KEY가 없을 때
- **THEN** 건너뛰고 에러 기록

### Requirement: GPT Image로 투명 배경 아이콘을 생성해야 한다

#### Scenario: GPT Image 생성
- **WHEN** OPENAI_API_KEY가 설정되어 있을 때
- **THEN** gpt-image-1 모델, 1024x1024, quality: high, background: transparent, output_format: png
- **THEN** b64_json 또는 url에서 PNG 추출 → `outputs/round-a/{id}_gpt.png` 저장

### Requirement: Claude SVG로 코드 기반 아이콘을 생성해야 한다

#### Scenario: Claude SVG 생성
- **WHEN** ANTHROPIC_API_KEY가 설정되어 있을 때
- **THEN** Claude Sonnet에 SVG viewBox 512x512, fill-only, feGaussianBlur 글로우 요청
- **THEN** `<svg>...</svg>` 정규식 추출 → `outputs/round-a/{id}_claude.svg` 저장

### Requirement: 6가지 기준으로 사람이 평가해야 한다

#### Scenario: 평가 기준
- **WHEN** 모든 API 결과물이 생성되었을 때
- **THEN** 사람이 다음 6기준을 각 1~5점으로 채점한다:
  1. 플랫 벡터 느낌
  2. 컬러 정확도 (프롬프트 hex와 일치)
  3. 쿠르츠게작트 유사도
  4. 투명 배경 (SVG는 N/A)
  5. 에셋 활용 가능성 (모션 그래픽스 오버레이용)
  6. 5개 아이콘 간 일관성
- **THEN** 합계가 가장 높은 API를 실험 B에 사용한다

### 성공 기준

| 기준 | 목표 |
|------|------|
| 최소 2개 API 테스트 | Claude SVG + 1개 이상 |
| API당 생성 성공률 | 5개 중 4개 이상 (80%) |
| 6개 평가 항목 전부 채점 | 완료 |
| 1등 API 선정 + 근거 | 기록 |
