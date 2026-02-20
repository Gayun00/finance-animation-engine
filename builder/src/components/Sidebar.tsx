import React from "react";
import { useBuilderStore } from "../state/builder-store";
import { getPresetById } from "../data/preset-registry";

export const Sidebar: React.FC = () => {
  const scenes = useBuilderStore((s) => s.scenes);
  const selectedIndex = useBuilderStore((s) => s.selectedSceneIndex);
  const selectScene = useBuilderStore((s) => s.selectScene);
  const removeScene = useBuilderStore((s) => s.removeScene);
  const moveScene = useBuilderStore((s) => s.moveScene);

  return (
    <div
      style={{
        width: 240,
        minWidth: 240,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-secondary)",
        }}
      >
        장면 목록 ({scenes.length})
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {scenes.length === 0 && (
          <div style={{ padding: "20px 8px", color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
            우측에서 프리셋을 선택하여<br />장면을 추가하세요
          </div>
        )}
        {scenes.map((scene, i) => {
          const preset = getPresetById(scene.presetId);
          const isSelected = selectedIndex === i;
          return (
            <div
              key={scene.id}
              onClick={() => selectScene(i)}
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                marginBottom: 4,
                cursor: "pointer",
                background: isSelected ? "var(--bg-tertiary)" : "transparent",
                border: isSelected ? "1px solid var(--accent)" : "1px solid transparent",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{preset?.icon ?? "?"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {scene.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {(scene.durationInFrames / 30).toFixed(0)}초
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {i > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); moveScene(i, i - 1); }}
                      style={{ fontSize: 10, padding: "2px 4px", borderRadius: 3, background: "var(--bg-tertiary)" }}
                      title="위로"
                    >
                      ▲
                    </button>
                  )}
                  {i < scenes.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); moveScene(i, i + 1); }}
                      style={{ fontSize: 10, padding: "2px 4px", borderRadius: 3, background: "var(--bg-tertiary)" }}
                      title="아래로"
                    >
                      ▼
                    </button>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeScene(i); }}
                  style={{
                    fontSize: 12,
                    padding: "2px 6px",
                    borderRadius: 3,
                    color: "var(--red)",
                    background: "var(--bg-tertiary)",
                  }}
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
