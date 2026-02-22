# Asset Pipeline Validation — Experiment Log

> 금융 교육 애니메이션 엔진의 에셋 자동 생성 파이프라인 검증 기록.
> 마일스톤마다 타임스탬프 + 결과 + 발견 + 다음 액션을 기록한다.

---

## 2026-02-20

### 23:51 — 실험 시작, 환경 준비

**상태**: Phase 0 시작
**한 일**:
- OpenSpec 구조화 완료 (proposal, design, tasks, specs 4종)
- experiment/ 디렉토리 생성 (outputs/round-a,b,c, reference, api)
- EXPERIMENT-LOG.md 생성

**다음**: API 키 확인 → 실험 A 코드 작성 → 실행

---

## 2026-02-21

### 00:15 — Phase 0 완료, Phase A 시작

**상태**: 환경 준비 완료
**한 일**:
- .env 설정 (ANTHROPIC_API_KEY from e2eagent/.env)
- dotenv + tsx 패키지 설치
- prompts.ts 작성 (STYLE_PREFIX + TEST_ICONS 5종)
- API 키 확인: ANTHROPIC (O), OPENAI (X), RECRAFT (X→MCP 대체)

### 00:30 — Phase A 완료: Claude SVG 선택

**결과**: Claude SVG 23/25 > Recraft V3 15/30
**핵심 발견**:
- Recraft recraftv3에서 flat_2 substyle 불가 (recraftv2 전용)
- emotional_flat substyle은 배경색 지시를 무시하고 자체 배경색 사용
- Claude SVG는 hex 색상, 배경, 글로우 지시를 완벽히 따름
- GPT Image: OPENAI_API_KEY 미보유로 스킵
**결정**: Claude SVG를 메인 API로 선택 (제어가능성 + 일관성 우선)

### 00:45 — Phase B 완료: Reference 수렴 성공

**결과**: 일관성 35/50 (기준 35↑ 통과)
**방법**: SVG 코드 분석으로 스타일 추출 (Vision 대신) → extracted-style.txt → 프롬프트 삽입
**강점**: 배경 9/10, 컬러톤 8/10
**약점**: 형태 언어 5/10, 디테일 6/10
**Outlier**: bank_building, clock_money
**결정**: C 진행. 프롬프트에 "organic rounded shapes" 보강.

### 01:15 — Phase C 완료: 30/30 PASS

**배치 생성**: 30/30 성공 (100%)
**QA**: 30/30 PASS, 평균 44.5/50
**일관성**: 전체 8.0/10
**Production**: 30개 모두 outputs/production/에 확보

### 01:30 — 최종 보고서 완료

**최종 결과**:
| 항목 | 결과 |
|------|------|
| 선택 API | Claude SVG (claude-sonnet-4) |
| Reference 수렴 | 성공 (35/50) |
| Production 확보 | 30/30 (100%) |
| QA 평균 | 44.5/50 |
| 일관성 | 8.0/10 |
| 아이콘당 비용 | ~$0.01 |
| 30개 배치 시간 | ~4분 |

**다음 단계**: 사람 시각 검수 → outlier 튜닝 → asset-matcher.ts 등록

---
