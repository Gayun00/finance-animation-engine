## ADDED Requirements (부록 — 후순위)

> 프리셋 확장 시 활용. 현재는 에셋 생성이 우선.

### Requirement: 영상에서 프레임을 추출하고 Vision으로 분석해야 한다

#### Scenario: 프레임 추출 + 분석
- **WHEN** 프리셋을 확장할 필요가 생겼을 때
- **THEN** yt-dlp + ffmpeg으로 10초 간격 프레임 추출 (15~20장)
- **THEN** Claude Vision으로 프레임별 composition_type, layout, color, depth_layers, effects, motion_estimation을 JSON으로 추출
- **THEN** 분석 결과를 종합하여 6개 이상 프리셋 JSON 생성

### Requirement: 분석 결과를 재사용 가능한 프리셋으로 변환해야 한다

#### Scenario: 프리셋 변환
- **WHEN** 프레임 분석 JSON이 준비되었을 때
- **THEN** 반복 패턴을 추출하여 프리셋으로 변환한다
- **THEN** 기존 `src/types/index.ts`의 Scene 타입과 호환 가능한 구조여야 한다

### 성공 기준

| 기준 | 목표 |
|------|------|
| Vision JSON 파싱 성공률 | 80% 이상 |
| 생성 프리셋 수 | 6개 이상 |
| 프리셋 다양성 | 서로 다른 layout type |

> 상세 코드 및 스키마는 이전 버전 문서 참조.
