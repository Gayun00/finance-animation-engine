## ADDED Requirements

### Requirement: 금융 교육용 아이콘 30종을 정의해야 한다

#### Scenario: PRODUCTION_ICONS 정의
- **WHEN** 배치 생성을 시작할 때
- **THEN** 6개 카테고리로 30종 아이콘을 정의한다:
  - **돈/자산** (6): coin_gold, coin_silver, bills_stack, money_bag, wallet, credit_card
  - **차트/데이터** (4): chart_line_up, chart_line_down, chart_bar, chart_pie
  - **금융 개념** (6): percent_up, percent_down, piggy_bank, bank_building, safe_box, scale_balance
  - **시간/성장** (4): clock, hourglass, seedling, tree
  - **사람/행동** (4): handshake, target, shield_check, lightbulb
  - **방향/상태** (6): arrow_up, arrow_down, check_circle, x_circle, warning, star

### Requirement: 확정된 파이프라인으로 30개를 배치 생성해야 한다

#### Scenario: 배치 생성 실행
- **WHEN** extracted-style.txt와 선택 API가 준비되었을 때
- **THEN** 각 아이콘에 대해 `{스타일 설명} + {아이콘 설명}` 프롬프트로 생성한다
- **THEN** rate limit 방지를 위해 호출 간 3초 간격을 둔다
- **THEN** 결과를 `outputs/round-c/{id}.png`에 저장한다
- **THEN** `batch-log.json`에 성공/실패 기록

#### Scenario: 생성 실패 처리
- **WHEN** 특정 아이콘 생성이 실패했을 때
- **THEN** 에러 메시지를 기록하고 다음 아이콘으로 진행한다
- **THEN** 실패 목록은 나중에 재시도할 수 있도록 별도 기록한다

### Requirement: Vision QA로 10개 항목을 자동 채점해야 한다

#### Scenario: 개별 에셋 QA
- **WHEN** 생성된 아이콘 PNG가 있을 때
- **THEN** Claude Vision에 이미지 + 아이콘 설명을 전송한다
- **THEN** 10개 항목을 각 1~5점으로 채점한다:
  1. `flat_vector`: 플랫 벡터, 3D/사실적 텍스처 없음
  2. `color_match`: dark navy 배경 + vibrant accent 사용
  3. `no_outlines`: 두꺼운 외곽선 없음
  4. `clean_shapes`: 깔끔한 기하학적 형태
  5. `glow_effect`: 세트와 일관된 미묘한 글로우
  6. `transparent_bg`: 투명 배경 또는 dark navy
  7. `identifiable`: 의도한 오브젝트로 명확히 인식 가능
  8. `animation_ready`: 모션 그래픽스에 바로 사용 가능
  9. `no_artifacts`: 생성 아티팩트 없음
  10. `consistent_style`: 세트 내 다른 아이콘과 일관

#### Scenario: Pass/Fail 판정
- **WHEN** 10개 항목 점수가 산출되었을 때
- **THEN** 합계 38/50 이상 → Pass
- **THEN** Pass된 에셋은 `outputs/production/`으로 자동 복사
- **THEN** Fail된 에셋은 `issues` + `fix_suggestions` 출력

### Requirement: 에셋 세트의 일관성을 최종 검수해야 한다

#### Scenario: 일관성 검수
- **WHEN** production/ 폴더에 Pass된 에셋들이 모여있을 때
- **THEN** 8장씩 묶어서 Claude Vision에 전송한다
- **THEN** 4개 항목을 각 1~10점으로 채점한다:
  - `overall_score`: 전체 일관성
  - `color_consistency`: 색상 톤 일관성
  - `style_consistency`: 스타일 일관성
  - `detail_consistency`: 디테일 수준 일관성
- **THEN** outlier 아이콘을 식별하고 수정 방법을 제안한다

### Requirement: 실패한 에셋을 재생성할 수 있어야 한다

#### Scenario: 재생성
- **WHEN** QA에서 Fail된 에셋이 있을 때
- **THEN** `fix_suggestions`를 프롬프트에 반영하여 재생성한다
- **THEN** 재생성된 에셋도 동일한 QA를 거친다
- **THEN** 2회 재시도 후에도 Fail이면 해당 아이콘은 수동 처리로 표시한다

### 성공 기준

| 기준 | 목표 |
|------|------|
| 배치 생성 성공률 | 30개 중 27개 이상 (90%) |
| QA 통과율 | 생성된 에셋의 70% 이상 |
| 평균 품질 점수 | 38/50 이상 |
| 일관성 점수 | overall 7/10 이상 |
| 재생성 후 최종 production 확보 | 25개 이상 |
