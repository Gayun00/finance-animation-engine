## ADDED Requirements

### Requirement: 실험 A 최고 결과 3장을 reference로 선별해야 한다

#### Scenario: Reference 선별
- **WHEN** 실험 A의 평가가 완료되었을 때
- **THEN** 1등 API 결과물 중 가장 잘 나온 이미지 3장을 선택한다
- **THEN** `experiment/reference/` 폴더에 `ref_01.png`, `ref_02.png`, `ref_03.png`로 복사한다
- **THEN** 이 3장이 "스타일 기준"이 된다

### Requirement: Vision으로 reference 이미지의 스타일을 추출해야 한다

#### Scenario: 스타일 설명 추출
- **WHEN** reference 3장이 준비되었을 때
- **THEN** GPT-4o Vision 또는 Claude Vision에 3장을 함께 전송한다
- **THEN** 색상 팔레트(hex), 형태 스타일, 글로우 효과, 배경 처리, 디테일 수준, 비율을 포함한 상세 스타일 설명을 추출한다
- **THEN** `outputs/round-b/extracted-style.txt`에 저장한다

### Requirement: 스타일 설명 기반으로 새 아이콘 5종을 생성해야 한다

실험 A에 없던 새로운 아이콘을 추출된 스타일 설명 + 프롬프트로 생성한다.

#### Scenario: 새 아이콘 5종 정의
- **WHEN** 생성할 아이콘을 정의할 때
- **THEN** 실험 A와 겹치지 않는 다음 5종을 사용한다:
  1. `icon_bank_building` — 은행 건물
  2. `icon_shield_check` — 보안 방패
  3. `icon_clock_money` — 시간가치 시계
  4. `icon_graph_bar` — 상승 막대 차트
  5. `icon_wallet` — 지갑

#### Scenario: 스타일 설명 + 프롬프트 조합 생성
- **WHEN** extracted-style.txt와 아이콘 설명이 준비되었을 때
- **THEN** 프롬프트 = `{스타일 설명}\n\nGenerate icon: {아이콘 설명}\nSame flat vector style, same color palette, same glow treatment.`
- **THEN** 1등 API로 생성 → `outputs/round-b/{id}.png` 저장

#### Scenario: Recraft 대안 — style_id 등록
- **WHEN** Recraft가 1등 API이고 API 키가 있을 때
- **THEN** reference 3장으로 커스텀 스타일을 등록 (`POST /v1/styles`)
- **THEN** 반환된 style_id로 생성 (`style_id` 파라미터)

### Requirement: reference + 새 아이콘의 일관성을 평가해야 한다

#### Scenario: 일관성 평가 (사람)
- **WHEN** reference 3장 + 새 아이콘 5장이 모두 생성되었을 때
- **THEN** 8장을 나란히 놓고 다음 5기준을 각 1~10점으로 채점한다:
  1. 같은 세트처럼 보이는가
  2. 컬러 톤이 일관되는가
  3. 디테일 수준이 비슷한가
  4. 형태 언어가 통일되는가
  5. 배경 처리가 일관되는가

#### Scenario: 수렴 판정
- **WHEN** 합계 점수가 나왔을 때
- **THEN** 35/50 이상 → 수렴 성공, 실험 C 진행
- **THEN** 25~34 → 프롬프트 조정 후 재시도
- **THEN** 24 이하 → 대안 검토 (다른 API, 수동 스타일 가이드 등)

### 성공 기준

| 기준 | 목표 |
|------|------|
| 스타일 설명 추출 | 구체적인 hex 색상 + 형태 설명 포함 |
| 새 아이콘 5종 생성 | 전부 성공 |
| 일관성 합계 | 35/50 이상 |
| 육안으로 같은 세트 | reference와 구별 어려운 수준 |
