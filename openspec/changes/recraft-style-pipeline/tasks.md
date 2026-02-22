## /note 기록 규칙

> 이전 실험과 동일. Phase 완료 시, 중요 발견 시, 최종 보고서 시 `/note` 기록.
> 구체적 수치 + 의사결정 과정 포함.

## 0. Reference 이미지 탐색 (~20분)

- [ ] 0.1 Recraft substyle 탐색: 금화 아이콘을 여러 substyle로 생성 비교
  - emotional_flat (기존), roundish_flat, segmented_colors, vivid_shapes, substyle 없음
  - 각 1~2장씩 생성 → 총 5~10장
- [ ] 0.2 가장 "Kurzgesagt 스타일 + 네이비 배경"에 가까운 substyle 선택
- [ ] 0.3 선택된 substyle로 대표 아이콘 5장 생성 (금화, 차트, 저금통, 지폐, 퍼센트)
- [ ] 0.4 최고 결과 3~5장을 reference로 선별 → experiment/reference/recraft/

```
탐색 결과:
  | substyle          | 배경 통제 | 시각 품질 | Kurzgesagt 유사도 | 선택 |
  |-------------------|---------|---------|-----------------|------|
  | emotional_flat    | _/5     | _/5     | _/5             |      |
  | roundish_flat     | _/5     | _/5     | _/5             |      |
  | segmented_colors  | _/5     | _/5     | _/5             |      |
  | vivid_shapes      | _/5     | _/5     | _/5             |      |
  | (없음)            | _/5     | _/5     | _/5             |      |
  ★ 최종 substyle: ___
```

## 1. 커스텀 스타일 등록 (~10분)

- [ ] 1.1 선별된 reference 이미지로 Recraft create_style 호출 (MCP)
- [ ] 1.2 반환된 style_id 기록
- [ ] 1.3 style_id로 테스트 아이콘 2~3장 생성하여 스타일 적용 확인
- [ ] 1.4 배경 통제 확인 — 네이비 배경이 유지되는지
  - 안 되면: remove_background + replace_background MCP로 후처리 파이프라인 구성

```
커스텀 스타일 결과:
  style_id: ___
  reference 이미지 수: ___장
  테스트 결과:
  - 배경 통제: ___
  - 스타일 일관성: ___
  - 후처리 필요 여부: ___
```

## 2. 배치 생성 (~20분)

- [ ] 2.1 기존 prompts-production.ts의 30종 아이콘 정의 재사용
- [ ] 2.2 style_id + 아이콘 설명으로 30개 MCP 배치 생성
  - 생성 간격: rate limit 고려
  - 결과: experiment/outputs/recraft-batch/{id}.png (또는 .svg)
- [ ] 2.3 배경 후처리 필요 시: remove_background → replace_background 파이프라인 실행
- [ ] 2.4 batch-log.json 기록

```
배치 생성 결과:
  생성 시도: ___개
  생성 성공: ___개 (___%)
  후처리 필요: ___개
  크레딧 사용: ___
```

## 3. QA + 일관성 검수 (~30분)

- [ ] 3.1 기존 QA 스크립트(run-c-qa.ts)를 PNG 이미지 대응으로 수정
  - SVG 코드 분석 → Claude Vision 이미지 분석으로 변경
  - base64 인코딩하여 Claude Vision에 전송
- [ ] 3.2 30개 아이콘 QA 실행 (10항목 × 5점, 38/50↑ Pass)
- [ ] 3.3 Pass 에셋 → outputs/production-recraft/ 복사
- [ ] 3.4 일관성 검수: 8장씩 묶어서 Vision 평가
- [ ] 3.5 Fail 에셋 재생성 (프롬프트 조정 또는 다른 substyle 시도)

```
QA 결과:
  QA 통과: ___개 (___%)
  평균 품질 점수: ___/50
  일관성 점수: ___/10
  재생성 필요: ___개
  최종 production 확보: ___개
```

## 4. 사람 시각 검수 + 최종 선별

- [ ] 4.1 production 아이콘 전체를 브라우저/뷰어에서 열어 사람이 확인
- [ ] 4.2 시각적으로 부적합한 아이콘 표시 → 재생성 또는 제외
- [ ] 4.3 최종 production 세트 확정

## 5. Claude SVG vs Recraft 최종 비교 보고

- [ ] 5.1 동일 아이콘 나란히 비교 (Claude SVG vs Recraft)
- [ ] 5.2 최종 판정 + 파이프라인 권장사항
- [ ] 5.3 /note 최종 기록

```
최종 비교:
  | 기준          | Claude SVG | Recraft (style_id) |
  |--------------|-----------|-------------------|
  | 시각 품질      | _/10     | _/10              |
  | 일관성        | _/10     | _/10              |
  | 제어가능성     | _/10     | _/10              |
  | 비용          | $___     | $___              |
  | 속도          | ___분     | ___분              |
  | production 적합 | _/10   | _/10              |

  ★ 최종 권장 파이프라인: ___
  ★ 이유: ___
```
