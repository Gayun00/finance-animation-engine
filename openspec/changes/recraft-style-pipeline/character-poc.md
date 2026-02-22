# 캐릭터 POC — 현황 + 다음 단계

> 로드맵 1-D. 캐릭터 파이프라인 검증

---

## 현황 요약

### 완료

| 항목 | 결과 | 파일 |
|------|------|------|
| SVG→Lottie 변환 파이프라인 | ✅ 5개 SVG 변환 성공 | `parse-svg.ts`, `path-to-lottie.ts`, `build-lottie.ts`, `convert.ts` |
| 모션 프리셋 6종 | ✅ float, bounce, rotate, pulse, swing, fade_in | `motion-presets.ts` |
| Recraft 캐릭터 SVG 생성 | ✅ 3체 (standing, walking, waving) | `experiment/outputs/character/*.svg` |
| 기존 Lottie 해부 | ✅ Bearded Man Walking 파트 추출 | `extract-lottie-parts.ts` |
| Person Walking 리깅 분석 | ✅ 10-layer Rotation 뼈대 파악 | `Downloads/Person Walking (1).json` |
| 리스킨 (색상 교체) | ✅ 3종 팔레트 자동 교체 | `reskin-lottie.ts` |
| Shape 이식 시도 | ⚠️ 동작하나 품질 부족 | `transplant-shapes.ts` |

### 실패/학습

| 시도 | 결과 | 원인 |
|------|------|------|
| Y좌표 휴리스틱 부위 분리 | ❌ 엉망 | path가 부위 단위로 분리되지 않음 (셔츠+팔이 하나의 path 등) |
| 타 Lottie → Person Walking shape 이식 | ⚠️ 부자연스러움 | 좌표계/비율/겹침구조 불일치 |
| Geometric shape (원형, 사각형) | ⚠️ 동작하나 너무 단순 | 캐릭터라기보다 도형 |

### 핵심 발견

- **색상 교체는 쉽다** — fill 값만 바꾸면 팔레트 변주 자동화 가능
- **형태 변주는 어렵다** — 다른 외양을 만들려면 "부위 분리"가 핵심 병목
- **리깅 구조는 파악 완료** — Person Walking의 10-layer 구조가 가장 심플하고 범용적
  - Body(root) → Head, Arms(upper→forearm), Legs(upper→lower)
  - 모든 관절은 Rotation만으로 동작 (Position은 전체 이동용)

---

## 다음 단계: Claude Vision 기반 부위 분리 + 리깅

### 핵심 파이프라인

```
캐릭터 이미지 (정적, 모션 없음)
  ↓ Recraft vector_illustration
캐릭터 SVG (path 분리됨)
  ↓ Claude Vision + 원본 PNG
부위 라벨링 (head, body, l_arm, r_arm, l_leg, r_leg)
  ↓ Person Walking 리깅 적용
걷는 캐릭터 Lottie
```

### 작업 목록

- [ ] **Step 1**: Claude Vision 부위 라벨링 실행
  - `vision-label.ts` 준비 완료 (원본 PNG + path bbox/색상 → Claude Sonnet)
  - `char_standing_side.svg` (11 paths)로 첫 테스트
  - 검증: 라벨링 결과를 오버레이 SVG로 시각화

- [ ] **Step 2**: 라벨링 → Person Walking 리깅 적용
  - 라벨링된 path를 부위별 그룹핑
  - 각 그룹의 bounding box에서 앵커포인트 계산 (관절 위치)
  - Person Walking 키프레임 복사 + shape 교체
  - 좌표 정규화: SVG viewBox(2048x2048) → rig canvas(640x480)

- [ ] **Step 3**: 검증
  - 빌더 Remotion Player에서 걷기 애니메이션 재생
  - 원본 SVG와 비교: 외양 유지 + 모션 자연스러움
  - 3체 모두 적용: standing, walking, waving

- [ ] **Step 4**: 정적 캐릭터도 동일 파이프라인 적용
  - 사용자 레퍼런스 이미지 → Recraft SVG → Vision 라벨링 → 리깅
  - 모션이 없는 캐릭터에도 걷기/손흔들기 자동 적용 가능 증명

### 도전 과제

1. **Vision 라벨링 정확도**: 옆모습 캐릭터에서 앞/뒤 팔다리 구분이 어려울 수 있음
2. **앵커포인트 정확도**: bounding box 기반 자동 계산이 관절 위치와 맞는지
3. **비율 조정**: Recraft SVG의 캐릭터 비율과 Person Walking 리깅의 비율 차이
4. **겹침 순서**: z-order (어떤 팔이 몸통 앞에, 어떤 다리가 뒤에)

### 파일 구조

```
experiment/svg-to-lottie/
  vision-label.ts        ← Claude Vision 부위 라벨링 (다음 실행)
  parse-svg.ts           — SVG 파서
  path-to-lottie.ts      — SVG path → Lottie shape 변환
  build-lottie.ts        — Lottie JSON 조립
  motion-presets.ts      — 6종 모션 프리셋
  convert.ts             — 단일 파일 CLI 변환기
  extract-lottie-parts.ts — Lottie → 파트별 SVG 추출
  reskin-lottie.ts       — fill 색상 교체
  shape-swap.ts          — 파라미터 기반 geometric shape 생성
  transplant-shapes.ts   — 타 Lottie shape 이식
  label-body-parts.ts    — (구) 휴리스틱 라벨링 (실패, 참고용)
```
