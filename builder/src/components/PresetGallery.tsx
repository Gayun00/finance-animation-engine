import React from "react";
import { PRESET_REGISTRY } from "../data/preset-registry";
import { useBuilderStore } from "../state/builder-store";

export const PresetGallery: React.FC = () => {
  const addScene = useBuilderStore((s) => s.addScene);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, marginBottom: 8, color: "var(--text-primary)" }}>
        프리셋 선택
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: 13 }}>
        장면 유형을 선택하면 시퀀스에 추가됩니다.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {PRESET_REGISTRY.map((preset) => (
          <button
            key={preset.id}
            onClick={() => addScene(preset.id)}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "18px 16px",
              textAlign: "left",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{preset.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              {preset.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {preset.description}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              {preset.guide}
            </div>
            <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 8 }}>
              슬롯 {preset.slots.length}개 &middot;{" "}
              {(preset.defaultDurationInFrames / 30).toFixed(0)}초
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
