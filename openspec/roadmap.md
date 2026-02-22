# 에셋 & 애니메이션 파이프라인 로드맵

## 비전

금융 교육 콘텐츠 애니메이션을 위한 자동화 파이프라인.
배경, 요소, 캐릭터를 일관된 스타일로 생성하고, Lottie 모션을 붙여 에셋화하고,
프리셋 기반으로 풍성한 애니메이션을 조합한다.
최종적으로는 레퍼런스 영상을 분석해서 프리셋과 에셋이 자동으로 확장되는 구조.

---

## 현재 보유 자산

| 영역 | 상태 |
|------|------|
| 엔진 | Remotion 기반, 컴포넌트 20종, 전환 8종, 프리셋 13종 |
| 레이아웃 | 6종 (Center, Split, TopBottom, Grid, Focus, FullScreen) |
| 에셋 | Lottie 45개 (톤앤매너 제각각) |
| 패럴랙스 | ParallaxScene 구현 완료 |
| 이펙트 | FloatingParticles, GradientOrb, GeometricDecor, Spotlight |
| 씬 컴포저 | 규칙 기반 + LLM 보조 조합 |
| 에셋 매칭 | asset-matcher.ts (키워드 기반, 45개 등록) |
| 실험 결과 | Recraft > Claude SVG > GPT Image (품질), 배경 통제가 핵심 과제 |

---

## Tier 1: 에셋 생성 파이프라인 ← 지금

**목표**: 요소/배경을 일관된 스타일로 생성, Lottie JSON 에셋으로 확보

### 1-A. 정적 요소 (아이콘/소품) — 진행 중

> 상세: `changes/recraft-style-pipeline/`

- 사람이 레퍼런스 수집 → AI 일관성 평가 → 트라이얼 → 사람 승인 → 배치 생성
- Recraft create_style + style_id로 일관성 확보
- 30종 production 아이콘 확보
- 출력: PNG/SVG → Lottie 컨테이너로 래핑 (정적 또는 단순 모션)

### 1-B. 배경

- 동일 파이프라인 적용 (레퍼런스 수집 → 적합도 → 트라이얼 → 승인 → 배치)
- 카테고리: 사무실, 도시, 추상, 우주, 자연 등 5~10종
- 와이드 비율 대응 필요 (Recraft 지원 사이즈 확인)
- 모션은 코드: 패럴랙스(기존), 컬러 전환, 미세 드리프트

### 1-C. Lottie 모션 템플릿 — ✅ 완료

- 정적 에셋에 모션을 붙이는 **프리셋 6종** 구현 완료
  - float, bounce, rotate, pulse, swing, fade_in
- `experiment/svg-to-lottie/motion-presets.ts` — null parent layer 패턴
- SVG→Lottie 변환 CLI: `convert.ts --motion float`
- Recraft SVG 5개 × 6프리셋 = 30개 모션 Lottie 생성 확인

### 1-D. 캐릭터 — 진행 중 (POC 검증 단계)

> 상세: `changes/recraft-style-pipeline/character-poc.md`

**완료:**
- SVG→Lottie 변환 파이프라인 (parse-svg, path-to-lottie, build-lottie)
- Recraft로 캐릭터 SVG 3체 생성 (standing, walking, waving)
- 기존 Lottie 해부 도구: `extract-lottie-parts.ts` (파트별 SVG + manifest 추출)
- Person Walking 리깅 분석: 10-layer 순수 Rotation 기반 걷기 뼈대
- 리스킨 도구: `reskin-lottie.ts` (fill 색상 교체, 3종 팔레트)
- Shape Swap 실험: geometric shape 생성 + 타 Lottie shape 이식

**실패/학습:**
- Y좌표 휴리스틱 부위 분리 → 품질 부족 (path가 부위 단위로 안 나뉨)
- 타 Lottie shape 이식 → 좌표계/비율 불일치로 자연스럽지 않음
- **핵심 발견**: 색상 교체는 쉽지만, 다른 외양의 캐릭터를 만들려면 "부위 분리"가 핵심 병목

**다음 단계 (미완):**
1. Claude Vision 기반 SVG path 부위 라벨링 (`vision-label.ts` 준비 완료)
   - 원본 PNG + path bbox/색상 정보 → Claude가 시각적으로 판단
   - 기존 Y좌표 휴리스틱보다 훨씬 정확할 것으로 예상
2. 라벨링된 path를 Person Walking 리깅에 연결
   - 부위별 path 그룹핑 → 앵커포인트 계산 → 키프레임 적용
3. 정적 캐릭터 이미지도 리깅 적용 가능하게
   - 모션 없는 캐릭터 SVG → 부위 분리 → 리깅 틀에 삽입 → 걷기/흔들기 등 모션 자동 적용

**참고 리소스 (Downloads):**
- Person Walking (1).json, Person Walking.json — 단순 리깅 뼈대 (10 layers, Rotation 전용)
- Cool Man.json — 복잡 리깅 (25 layers, Rotation + Path morph + Shape transforms)
- Rock Woman Walking.json, Child Girl Walking.json — 중간 복잡도 (15~17 layers, 분리된 발)

### Tier 1 성공 기준

| 항목 | 목표 |
|------|------|
| 정적 요소 | 25개↑ production 아이콘, 일관된 스타일 |
| 배경 | 5종↑, 패럴랙스 적용 가능 |
| 모션 템플릿 | 6종↑, 에셋 삽입 검증 완료 |
| 캐릭터 | 1체↑, 세그먼트 5종↑ |

---

## Tier 2: 애니메이션 제작 ← 다음

**목표**: Tier 1 에셋 + 기존 프리셋으로 영상 자동 조합

### 2-A. 에셋 레지스트리 확장

- Tier 1에서 확보된 에셋을 asset-matcher.ts에 등록
- 카테고리별 태깅 (요소/배경/캐릭터/이펙트)
- Lottie 메타데이터: 모션 타입, 세그먼트 정보, 색상 변주 목록

### 2-B. 씬 컴포저 강화

- 에셋 선택 로직 개선: 나레이션 → 적합한 에셋 + 레이아웃 + 전환 자동 조합
- 레이어 구성: 배경(패럴랙스) + 요소(모션 적용) + 캐릭터(세그먼트 선택) + 이펙트
- 타이밍 규칙: 나레이션 길이에 따른 전환/딜레이 자동 조정

### 2-C. 품질 검증

- 생성된 영상의 시각적 풍성함 체크리스트:
  - 배경 레이어 존재 여부
  - 요소 애니메이션 적용 여부
  - 전환 다양성 (연속 동일 전환 금지)
  - 색상 조화

---

## Tier 3: 자기 발전 파이프라인 ← 나중

**목표**: 레퍼런스 영상을 분석해서 프리셋/에셋 자동 확장

> 우선순위 낮음. 사람이 직접 AI로 확인하면서 점진적으로 구축.
> 당장 실행하지 않고, 계획으로 유지.

### 3-A. 영상 → 프레임 분석

```
yt-dlp로 레퍼런스 영상 다운로드
  → ffmpeg으로 프레임 추출 (10초 간격, 장면 전환점 감지 병행)
  → 이중 분석:
    프로그래밍: 색상 hex 추출 (dominant color), 장면 전환점
    Vision: 구조/레이아웃/요소 배치/이펙트/목적
  → 모션 분석: 전환 전후 프레임 2~3장 묶어서 전환 타입/카메라 모션 추출
```

### 3-B. 분석 → 프리셋 자동 생성

- 분석된 프레임에서 반복 패턴 추출
- 기존 프리셋 구조에 매핑: layout, background, parallax, effects, element_slots, color_palette, timing
- 목표: 영상 1편당 6~10개 고유 프리셋

### 3-C. 프리셋/에셋 자동 등록

- 생성된 프리셋을 presets.ts에 자동 추가
- 필요한 에셋이 없으면 → Tier 1 파이프라인으로 생성 요청
- 사람 승인 후 등록 확정

### Tier 3 성공 기준 (참고)

| 항목 | 목표 |
|------|------|
| 프레임 파싱 성공률 | 80%↑ |
| 색상 추출 정확도 | hex 기준 ΔE < 5 |
| 레이아웃 분류 정확도 | 기존 6종 매핑 기준 80%↑ |
| 프리셋 생성 | 영상 1편당 6개↑ |

---

## 우선순위 요약

```
[지금]  1-D 캐릭터: Claude Vision 부위 라벨링 → Person Walking 리깅 적용
        1-A 정적 요소 (recraft-style-pipeline, 30종 확보 완료)

[다음]  1-B 배경 (동일 파이프라인 확장)
        2-A 에셋 레지스트리 확장
        2-B 씬 컴포저 강화

[완료]  1-C Lottie 모션 템플릿 (6종 프리셋)

[나중]  3-A~C 영상 분석 → 프리셋 자동 확장
```

ROI: 정적 요소 ≈ 배경 > 모션 템플릿 > 캐릭터 >>> 영상 분석
