## /note 기록 규칙

> 실험 전 과정에서 `/note`로 기록을 남긴다. 컨텍스트 유지를 위해 반드시 지킨다.

- **Phase 완료 시**: 각 Phase(A, B, C) 완료 후 `/note` — 결과 수치, 선택 근거, 다음 단계 포함
- **중요 발견 시**: 예상 밖 결과, 실패 원인 분석, 의사결정 포인트에서 즉시 `/note`
- **최종 보고서 시**: Z단계에서 전체 실험 종합 `/note`
- **기록 포함 사항**: 구체적 수치 (점수, 통과율, 비용), 의사결정 과정과 근거, 다음 액션
- **category**: `애니메이션-제작-자동화` (프로젝트 기본값)

## 0. 환경 준비

- [x] 0.1 experiment/ 디렉토리 구조 생성 (outputs/, reference/, api/)
- [x] 0.2 npm 패키지 설치: @anthropic-ai/sdk, dotenv, tsx
- [x] 0.3 API 키 확인: ANTHROPIC_API_KEY (설정됨), OPENAI_API_KEY (없음→GPT 스킵), RECRAFT_API_KEY (없음→MCP 대체)
- [x] 0.4 prompts.ts 작성: STYLE_PREFIX + TEST_ICONS 5종 정의

## A. API 탐색 — 어디가 제일 낫나? (~30분)

- [x] A.1 api/recraft.ts 작성: Recraft V3 MCP 래퍼 (emotional_flat substyle, recraftv3)
- [x] A.2 api/gpt-image.ts: SKIPPED (OPENAI_API_KEY 없음)
- [x] A.3 api/claude-svg.ts 작성: Claude Sonnet SVG 생성 함수
- [x] A.4 run-a-claude-svg.ts 작성 + Recraft MCP 직접 호출
- [x] A.5 실행 완료 → outputs/round-a/ (Recraft SVG 5 + Claude SVG 5 = 10파일)
- [x] A.6 생성된 이미지 시각 확인 + 평가표 작성 (6기준 × 1~5점)
- [x] A.7 1등 API 선택: Claude SVG (23/25) > Recraft (15/30)

```
실험 A 결과 (2026-02-21):
  조건: Recraft V3 (recraftv3, vector_illustration, emotional_flat) vs Claude SVG (claude-sonnet-4)
  참고: GPT Image — OPENAI_API_KEY 미보유로 스킵

  | 기준              | Recraft | Claude SVG |
  |------------------|---------|------------|
  | 플랫 벡터 느낌     | 3/5    | 5/5        |
  | 컬러 정확도        | 2/5    | 5/5        |
  | 쿠르츠게작트 유사도  | 3/5    | 4/5        |
  | 투명 배경          | 2/5    | N/A (SVG)  |
  | 에셋 활용 가능성    | 3/5    | 4/5        |
  | 5개 간 일관성      | 2/5    | 5/5        |
  | 합계              | 15/30  | 23/25      |

  Recraft 문제점:
  - emotional_flat substyle이 프롬프트의 배경색 지시를 무시
  - 각 아이콘마다 다른 배경색 (금화=네이비, 차트=틸, 저금통=빨강, 지폐=주황, 퍼센트=핑크)
  - "no outlines" 무시 — 외곽선 존재
  - 시각적 풍부함은 높으나 일관성/제어가능성이 낮음

  Claude SVG 장점:
  - hex 색상, 배경, 글로우 등 프롬프트 지시를 거의 완벽히 따름
  - 5개 아이콘 간 스타일 완벽 통일
  - SVG이므로 크기/색상 수정이 프로그래밍적으로 쉬움

  Claude SVG 약점:
  - 너무 단순 (기본 도형만 사용) — 시각적 임팩트 낮음
  - "코드로 생성한 느낌"이 강함

  ★ 최종 선택: Claude SVG
  ★ 이유: 제어가능성 + 일관성이 에셋 파이프라인의 핵심. 단순함은 프롬프트 개선으로 보완 가능.
         Recraft는 substyle 변경으로 개선 가능성 있으나, 배경/스타일 통제가 어려움.
```

## B. Reference 수렴 테스트 — 스타일 통일 가능한가? (~30분)

- [x] B.1 실험 A 최고 3장 → reference/ (gold_coin, chart_up, piggy_bank)
- [x] B.2 prompts-round-b.ts 작성: 새 아이콘 5종 (bank, shield, clock, bar chart, wallet)
- [x] B.3 Reference SVG 코드 분석 → 스타일 설명 추출 (extracted-style.txt)
- [x] B.4 스타일 설명 + 새 프롬프트로 아이콘 5종 생성 → outputs/round-b/ (전부 성공)
- [x] B.5 일관성 평가 완료: 35/50 (수렴 성공)

```
실험 B 결과 (2026-02-21):
  API: Claude SVG (claude-sonnet-4)
  방식: Reference SVG 코드 분석 → 스타일 가이드 추출 → 프롬프트에 삽입

  | 기준                    | 점수 (1~10) |
  |------------------------|------------|
  | 같은 세트처럼 보이는가?   | 7/10      |
  | 컬러 톤이 일관되는가?     | 8/10      |
  | 디테일 수준이 비슷한가?   | 6/10      |
  | 형태 언어가 통일되는가?   | 5/10      |
  | 배경 처리가 일관되는가?   | 9/10      |
  | 합계                    | 35/50     |

  ✓ 35/50 → 수렴 성공, C 진행
  Outliers: icon_bank_building (건축물→복잡), icon_clock_money (구조적 차이)
  강점: 배경(9), 컬러(8) — 프롬프트 hex 색상 + 글로우 필터 일관
  약점: 형태 언어(5), 디테일 수준(6) — 유기적/기하학적 혼재
```

## C. 배치 생성 + 자동 QA (~1~2시간)

- [x] C.1 prompts-production.ts 작성: PRODUCTION_ICONS 30종 (6카테고리)
- [x] C.2 run-c-batch.ts 작성: extracted-style.txt + Claude SVG + Phase B 피드백 반영
- [x] C.3 배치 실행 완료: 30/30 성공 (100%)
- [x] C.4 run-c-qa.ts 작성: Vision QA 10항목 × 5점 자동 채점 (38/50↑ Pass)
- [x] C.5 QA 실행 완료: 30/30 PASS (100%), 평균 44.5/50
- [x] C.6 일관성 검수 완료: 전체 8.0/10, 컬러 8.5/10, 스타일 8.0/10, 디테일 6.3/10
- [x] C.7 QA 전부 PASS → 재생성 불필요. 일관성 outlier 6개는 향후 개선 대상

```
실험 C 결과 (2026-02-21):
  API: Claude SVG (claude-sonnet-4)
  스타일: extracted-style.txt + Phase B 보강 프롬프트

  생성 시도: 30개
  생성 성공: 30개 (100%)
  QA 통과: 30개 (100%)
  평균 품질 점수: 44.5/50
  최고: coin_gold, percent_down, piggy_bank (50/50)
  최저: chart_line_up (38/50)
  일관성 점수: 8.0/10 (전체), 8.5/10 (컬러), 8.0/10 (스타일), 6.3/10 (디테일)
  재생성 필요: 0개
  production 확보: 30개 / 30개
  일관성 outlier: arrow_down, arrow_up, chart_line_down, lightbulb, percent_up, tree
```

## (부록) D. 프레임 분석 → 프리셋 자동 추출

> 프리셋 확장 시 활용. 지금은 후순위.

- [ ] D.1 yt-dlp + ffmpeg으로 프레임 추출
- [ ] D.2 Claude Vision으로 프레임 분석
- [ ] D.3 분석 결과 → 프리셋 JSON 변환

## Z. 최종 보고서

- [x] Z.1 A/B/C 결과 종합
- [x] Z.2 파이프라인 실용성 판단
- [x] Z.3 production 에셋 → 엔진 통합 계획

```
최종 결과 (2026-02-21):
  선택 API: Claude SVG (claude-sonnet-4-20250514)
  비교 대상: Recraft V3 (recraftv3, emotional_flat) — 탈락, GPT Image — 키 미보유로 스킵
  Reference 수렴 성공 여부: 성공 (35/50, 기준 35↑)
  Production 아이콘 확보: 30개 / 30개 (QA 100% PASS, 평균 44.5/50)
  일관성 점수: 전체 8.0/10 (목표 7↑ 달성)
  아이콘당 예상 비용: ~$0.01 (Claude Sonnet API 1회 호출 ≈ 1K input + 2K output tokens)
  아이콘당 예상 시간: ~5초 (API 응답) + 3초 (rate limit 간격) = ~8초
  30개 배치 총 시간: ~4분
  사람 개입 필요 시점: 최종 시각 검수 (self-bias 우려), outlier 아이콘 확인

  파이프라인 실용성: ✓ 실용적
  - 비용 극소 ($0.3/30개), 시간 단축 (수동 대비 90%+)
  - 일관성이 높은 편이나 디테일 수준 편차 존재 (6.3/10)
  - SVG이므로 프로그래밍적 후처리(색상변경, 크기조절, 애니메이션) 용이

  한계:
  - Claude가 생성하고 Claude가 채점하므로 self-bias 가능 → 사람 최종 검수 필수
  - 시각적으로 단순함 (기본 도형 조합) → Kurzgesagt 수준의 풍부함 미달
  - Recraft 등 이미지 전문 API 대비 시각적 품질 낮음 (trade-off: 통제 가능성 높음)

  다음 단계:
  → 사람 검수 결과: Claude SVG는 수치적으로 통과했으나 시각적으로 너무 단순. "개별" 느낌.
  → 방향 전환 결정: Recraft 커스텀 스타일(create_style) + 배치 생성으로 전환.
  → 새 change "recraft-style-pipeline"으로 이어서 진행.
```
