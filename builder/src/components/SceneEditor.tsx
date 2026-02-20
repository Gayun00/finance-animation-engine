import React from "react";
import { useBuilderStore } from "../state/builder-store";
import { getPresetById } from "../data/preset-registry";
import { getAssetById } from "../data/asset-catalog";
import { TransitionPicker } from "./TransitionPicker";
import type { TransitionType } from "../types/preset-meta";

const TRANSITION_OPTIONS: { type: TransitionType; label: string }[] = [
  { type: "fade", label: "페이드" },
  { type: "wipe_left", label: "좌 와이프" },
  { type: "wipe_right", label: "우 와이프" },
  { type: "color_wipe", label: "컬러 와이프" },
  { type: "circle_shrink", label: "원 축소" },
  { type: "circle_wipe", label: "원 와이프" },
  { type: "zoom_in", label: "줌 인" },
  { type: "zoom_out", label: "줌 아웃" },
  { type: "slide_up", label: "슬라이드 업" },
  { type: "cross_dissolve", label: "크로스 디졸브" },
  { type: "none", label: "없음" },
];

export const SceneEditor: React.FC = () => {
  const selectedIndex = useBuilderStore((s) => s.selectedSceneIndex);
  const scenes = useBuilderStore((s) => s.scenes);
  const updateTitle = useBuilderStore((s) => s.updateSceneTitle);
  const updateDuration = useBuilderStore((s) => s.updateSceneDuration);
  const updateSubtitle = useBuilderStore((s) => s.updateSceneSubtitle);
  const setActiveSlot = useBuilderStore((s) => s.setActiveSlot);
  const activeSlotId = useBuilderStore((s) => s.activeSlotId);

  if (selectedIndex === null) return null;

  const scene = scenes[selectedIndex];
  const preset = getPresetById(scene.presetId);
  if (!preset) return null;

  return (
    <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
      {/* Preset guide */}
      <div
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius)",
          padding: 20,
          marginBottom: 20,
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>{preset.icon}</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{preset.name} 프리셋</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {preset.description}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            lineHeight: 1.7,
            background: "var(--bg-tertiary)",
            padding: "12px 14px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {preset.guide}
        </div>
      </div>

      {/* Scene settings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
            장면 제목
          </label>
          <input
            value={scene.title}
            onChange={(e) => updateTitle(selectedIndex, e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
            길이 (초)
          </label>
          <input
            type="number"
            value={Math.round(scene.durationInFrames / 30)}
            onChange={(e) => updateDuration(selectedIndex, Number(e.target.value) * 30)}
            min={1}
            max={30}
            style={{ width: "100%" }}
          />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
          자막
        </label>
        <input
          value={scene.subtitle}
          onChange={(e) => updateSubtitle(selectedIndex, e.target.value)}
          placeholder="하단에 표시될 자막 텍스트..."
          style={{ width: "100%" }}
        />
      </div>

      {/* Slots */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
          에셋 슬롯 ({preset.slots.length})
        </div>
        {preset.slots.map((slot) => {
          const assetId = scene.slotAssignments[slot.id];
          const asset = assetId ? getAssetById(assetId) : null;
          const isActive = activeSlotId === slot.id;

          return (
            <button
              key={slot.id}
              onClick={() => setActiveSlot(isActive ? null : slot.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                marginBottom: 6,
                borderRadius: "var(--radius-sm)",
                border: isActive
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
                background: isActive ? "var(--bg-tertiary)" : "var(--bg-secondary)",
                transition: "all 0.12s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {slot.label}
                    {slot.required && (
                      <span style={{ color: "var(--red)", marginLeft: 4, fontSize: 11 }}>필수</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {slot.description}
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: asset ? "var(--accent)" : "var(--bg-tertiary)",
                    color: asset ? "#000" : "var(--text-muted)",
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {asset ? asset.name : "비어있음"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Transition */}
      {selectedIndex > 0 && (
        <TransitionPicker sceneIndex={selectedIndex} />
      )}
    </div>
  );
};
