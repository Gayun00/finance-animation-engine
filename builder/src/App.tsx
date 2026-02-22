import React, { useEffect, useState } from "react";
import { useBuilderStore } from "./state/builder-store";
import { Sidebar } from "./components/Sidebar";
import { PresetGallery } from "./components/PresetGallery";
import { SceneEditor } from "./components/SceneEditor";
import { AssetPicker } from "./components/AssetPicker";
import { ExportPanel } from "./components/ExportPanel";
import { AssetReview } from "./components/AssetReview";

export const App: React.FC = () => {
  const selectedIndex = useBuilderStore((s) => s.selectedSceneIndex);
  const scenes = useBuilderStore((s) => s.scenes);
  const sequenceTitle = useBuilderStore((s) => s.sequenceTitle);
  const setTitle = useBuilderStore((s) => s.setSequenceTitle);
  const reset = useBuilderStore((s) => s.reset);
  const selectScene = useBuilderStore((s) => s.selectScene);
  const saveProject = useBuilderStore((s) => s.saveProject);
  const loadProject = useBuilderStore((s) => s.loadProject);
  const deleteProject = useBuilderStore((s) => s.deleteProject);
  const refreshProjects = useBuilderStore((s) => s.refreshProjects);
  const savedProjects = useBuilderStore((s) => s.savedProjects);

  const [showProjects, setShowProjects] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [viewMode, setViewMode] = useState<"builder" | "review">("builder");

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const totalSeconds = scenes.reduce((sum, s) => sum + s.durationInFrames / 30, 0);

  const handleSave = async () => {
    await saveProject();
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <header
        style={{
          height: 56,
          minHeight: 56,
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 12,
          background: "var(--bg-secondary)",
        }}
      >
        {/* Tab navigation */}
        <div style={{ display: "flex", gap: 0, marginRight: 12 }}>
          {(["builder", "review"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: viewMode === mode ? 700 : 400,
                background: "none",
                border: "none",
                borderBottom: viewMode === mode ? "2px solid var(--accent)" : "2px solid transparent",
                color: viewMode === mode ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {mode === "builder" ? "빌더" : "에셋 검수"}
            </button>
          ))}
        </div>
        {viewMode === "builder" && (
          <>
            <input
              value={sequenceTitle}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: 200,
                padding: "6px 10px",
                fontSize: 13,
              }}
              placeholder="영상 제목..."
            />
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {scenes.length}개 장면 &middot; {totalSeconds.toFixed(0)}초
            </div>
          </>
        )}
        <div style={{ flex: 1 }} />
        {viewMode === "builder" && (
          <>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setShowProjects((v) => !v); refreshProjects(); }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  background: showProjects ? "var(--accent)" : "var(--bg-tertiary)",
                  color: showProjects ? "#000" : undefined,
                  border: "1px solid var(--border)",
                }}
              >
                프로젝트
              </button>
              {showProjects && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 4,
                    width: 280,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600 }}>
                    저장된 프로젝트
                  </div>
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {savedProjects.length === 0 ? (
                      <div style={{ padding: "16px 12px", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                        저장된 프로젝트 없음
                      </div>
                    ) : (
                      savedProjects.map((p) => (
                        <div
                          key={p.name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 12px",
                            gap: 8,
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <button
                            onClick={async () => { await loadProject(p.name); setShowProjects(false); }}
                            style={{
                              flex: 1,
                              textAlign: "left",
                              fontSize: 12,
                              background: "none",
                              border: "none",
                              color: "var(--text-primary)",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            {p.name}
                            <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 6 }}>
                              {new Date(p.updatedAt).toLocaleDateString("ko-KR")}
                            </span>
                          </button>
                          <button
                            onClick={() => { if (confirm(`"${p.name}" 삭제?`)) deleteProject(p.name); }}
                            style={{
                              fontSize: 10,
                              background: "none",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              padding: "2px 4px",
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 12,
                background: saveStatus === "saved" ? "var(--green)" : "var(--bg-tertiary)",
                color: saveStatus === "saved" ? "#000" : undefined,
                border: "1px solid var(--border)",
                transition: "background 0.15s",
              }}
            >
              {saveStatus === "saved" ? "저장됨" : "저장"}
            </button>
            <ExportPanel />
            <button
              onClick={reset}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 12,
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              초기화
            </button>
          </>
        )}
      </header>

      {/* Body */}
      {viewMode === "review" ? (
        <AssetReview />
      ) : (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left: Sidebar */}
          <Sidebar />

          {/* Center: Editor or Gallery */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {selectedIndex !== null ? (
              <SceneEditor />
            ) : (
              <PresetGallery />
            )}

            {/* Bottom: Sequence timeline */}
            {scenes.length > 0 && (
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  padding: "10px 16px",
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  overflowX: "auto",
                  background: "var(--bg-secondary)",
                  minHeight: 52,
                }}
              >
                {scenes.map((scene, i) => {
                  const isSelected = selectedIndex === i;
                  return (
                    <React.Fragment key={scene.id}>
                      {i > 0 && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            padding: "2px 6px",
                            background: "var(--bg-tertiary)",
                            borderRadius: 4,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {scene.transitionType === "none" ? "—" : scene.transitionType.replace("_", " ")}
                        </div>
                      )}
                      <button
                        onClick={() => selectScene(i)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "var(--radius-sm)",
                          border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)",
                          background: isSelected ? "var(--bg-tertiary)" : "var(--bg-secondary)",
                          fontSize: 12,
                          fontWeight: isSelected ? 600 : 400,
                          whiteSpace: "nowrap",
                          color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                        }}
                      >
                        {scene.title}
                      </button>
                    </React.Fragment>
                  );
                })}
                <button
                  onClick={() => selectScene(null)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px dashed var(--border)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  + 추가
                </button>
              </div>
            )}
          </div>

          {/* Right: Asset Picker */}
          <AssetPicker />
        </div>
      )}
    </div>
  );
};
