## Why

asset-pipeline-validation 실험 결과, Claude SVG는 **수치적으로는 통과**(QA 44.5/50, 일관성 8.0/10)했지만 **시각적으로 너무 단순**했다. 기본 도형 조합이라 프로덕션 아이콘으로 쓰기엔 품질이 부족.

반면 Recraft V3는 시각적 품질이 높지만, `emotional_flat` substyle이 프롬프트의 배경색 지시를 무시하여 아이콘 간 일관성이 낮았다 (15/30).

**해결책**: Recraft의 **커스텀 스타일(`create_style`)** API를 활용한다. 잘 나온 이미지를 reference로 등록하면 style_id가 발급되고, 이후 모든 생성에 해당 style_id를 사용하여 **시각적 풍부함 + 일관성**을 동시에 확보할 수 있다.

## What Changes

- **Recraft 커스텀 스타일 생성**: reference 이미지로 style_id 등록
- **스타일 기반 배치 생성**: 30개 아이콘을 동일 style_id로 일괄 생성
- **기존 QA 체계 활용**: asset-pipeline-validation에서 만든 Vision QA + 일관성 검수 재사용
- **production 에셋 교체**: Claude SVG → Recraft PNG로 교체

## Capabilities

### New Capabilities
- `recraft-custom-style`: Recraft create_style API로 커스텀 스타일 등록 + style_id 관리
- `recraft-batch-generate`: style_id 기반 배치 생성 (MCP 도구 활용)

### Modified Capabilities
- 기존 QA 스크립트를 SVG→PNG 대응으로 수정
- 일관성 검수를 실제 이미지 Vision 분석으로 강화

## Impact

- **experiment/outputs/production/**: Recraft PNG 아이콘으로 교체
- **experiment/reference/**: 커스텀 스타일 기준 이미지 저장
- **비용**: Recraft 크레딧 사용 (현재 3000 잔여)
- **이전 실험 자산 활용**: prompts-production.ts (30종 정의), QA 기준 (10항목 × 5점)

## 이전 실험에서 배운 것 (컨텍스트)

| 항목 | 발견 |
|------|------|
| Recraft substyle | recraftv3에서 `flat_2` 불가, `emotional_flat`은 배경 통제 안 됨 |
| 배경 문제 | substyle이 프롬프트의 배경색 지시를 무시 — style_id로 해결 가능 |
| Claude SVG 한계 | 지시 준수는 완벽하나 시각적으로 기본 도형 수준, production 부적합 |
| QA self-bias | Claude가 생성+채점하면 높은 점수 → Recraft 생성 + Claude 채점이 더 객관적 |
| 일관성 핵심 | 배경 처리 + 컬러 톤이 일관성의 80% 결정 |
