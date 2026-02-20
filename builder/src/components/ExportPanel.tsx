import React, { useState } from "react";
import { useBuilderStore } from "../state/builder-store";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export const ExportPanel: React.FC = () => {
  const exportJSON = useBuilderStore((s) => s.exportJSON);
  const scenes = useBuilderStore((s) => s.scenes);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  if (scenes.length === 0) return null;

  const handleSendToStudio = async () => {
    setSaveStatus("saving");
    try {
      const json = exportJSON();
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  const handleDownload = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "builder-output.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const studioLabel: Record<SaveStatus, string> = {
    idle: "Studio로 보내기",
    saving: "저장 중...",
    saved: "저장 완료! Studio에서 확인",
    error: "저장 실패",
  };

  const studioColor: Record<SaveStatus, string> = {
    idle: "var(--accent)",
    saving: "var(--orange)",
    saved: "var(--green)",
    error: "var(--red)",
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={handleSendToStudio}
        disabled={saveStatus === "saving"}
        style={{
          padding: "8px 16px",
          borderRadius: "var(--radius-sm)",
          background: studioColor[saveStatus],
          color: "#000",
          fontSize: 13,
          fontWeight: 600,
          transition: "background 0.15s",
          opacity: saveStatus === "saving" ? 0.7 : 1,
        }}
      >
        {studioLabel[saveStatus]}
      </button>
      <button
        onClick={handleDownload}
        style={{
          padding: "8px 16px",
          borderRadius: "var(--radius-sm)",
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border)",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        JSON 다운로드
      </button>
    </div>
  );
};
