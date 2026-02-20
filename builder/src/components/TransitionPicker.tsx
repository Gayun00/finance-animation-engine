import React from "react";
import { useBuilderStore } from "../state/builder-store";
import type { TransitionType } from "../types/preset-meta";

const TRANSITIONS: { type: TransitionType; label: string; desc: string }[] = [
  { type: "fade", label: "페이드", desc: "부드러운 페이드" },
  { type: "wipe_left", label: "좌 와이프", desc: "왼쪽으로 밀기" },
  { type: "wipe_right", label: "우 와이프", desc: "오른쪽으로 밀기" },
  { type: "color_wipe", label: "컬러 와이프", desc: "색상 바가 밀기" },
  { type: "circle_shrink", label: "원 축소", desc: "원이 줄어듦" },
  { type: "circle_wipe", label: "원 와이프", desc: "원이 열림" },
  { type: "zoom_in", label: "줌 인", desc: "확대하며 전환" },
  { type: "zoom_out", label: "줌 아웃", desc: "축소하며 전환" },
  { type: "slide_up", label: "슬라이드 업", desc: "위로 밀기" },
  { type: "cross_dissolve", label: "크로스 디졸브", desc: "겹치며 교차" },
  { type: "none", label: "없음", desc: "전환 효과 없음" },
];

interface Props {
  sceneIndex: number;
}

export const TransitionPicker: React.FC<Props> = ({ sceneIndex }) => {
  const scenes = useBuilderStore((s) => s.scenes);
  const updateTransition = useBuilderStore((s) => s.updateTransition);
  const scene = scenes[sceneIndex];

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
        화면 전환
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {TRANSITIONS.map((t) => {
          const isActive = scene.transitionType === t.type;
          return (
            <button
              key={t.type}
              onClick={() => updateTransition(sceneIndex, t.type)}
              title={t.desc}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: isActive ? "var(--bg-tertiary)" : "var(--bg-secondary)",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                transition: "all 0.1s",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
