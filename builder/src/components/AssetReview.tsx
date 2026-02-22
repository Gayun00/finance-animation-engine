import React, { useEffect, useState, useCallback, useRef } from "react";
import { Player } from "@remotion/player";
import { AssetPreviewComposition, type MotionPreset } from "./AssetPreviewComposition";
import { LottiePreviewComposition } from "./LottiePreviewComposition";

interface ImageFile {
  filename: string;
  path: string;
  size: number;
  mtime: number;
}

interface CharacterFile extends ImageFile {
  type: "svg" | "json" | "png";
}

interface TrialReview {
  status: "approved" | "rejected" | "pending";
  feedback: string;
}

type ReviewData = Record<string, TrialReview>;

const MOTION_PRESETS: { key: MotionPreset; label: string }[] = [
  { key: "none", label: "정지" },
  { key: "float", label: "둥둥" },
  { key: "bounce", label: "바운스" },
  { key: "pulse", label: "펄스" },
  { key: "rotate", label: "회전" },
  { key: "swing", label: "흔들기" },
];

export const AssetReview: React.FC = () => {
  const [references, setReferences] = useState<ImageFile[]>([]);
  const [trials, setTrials] = useState<ImageFile[]>([]);
  const [characters, setCharacters] = useState<CharacterFile[]>([]);
  const [reviewData, setReviewData] = useState<ReviewData>({});
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null);
  const [previewMotion, setPreviewMotion] = useState<MotionPreset>("float");
  const [previewBg, setPreviewBg] = useState<"dark" | "light" | "checker">("dark");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReferences = useCallback(async () => {
    const res = await fetch("/api/review/references");
    setReferences(await res.json());
  }, []);

  const loadTrials = useCallback(async () => {
    const res = await fetch("/api/review/trials");
    setTrials(await res.json());
  }, []);

  const loadCharacters = useCallback(async () => {
    const res = await fetch("/api/review/characters");
    const all: CharacterFile[] = await res.json();
    // 메타 파일 제외 (character-style-info.json 등)
    setCharacters(all.filter((c) => c.type !== "json" || !c.filename.includes("style-info")));
  }, []);

  const loadReview = useCallback(async () => {
    const res = await fetch("/api/review/trials/load-review");
    const data = await res.json();
    if (data && typeof data === "object") setReviewData(data);
  }, []);

  useEffect(() => {
    loadReferences();
    loadTrials();
    loadCharacters();
    loadReview();
  }, [loadReferences, loadTrials, loadCharacters, loadReview]);

  const getReview = (filename: string): TrialReview =>
    reviewData[filename] || { status: "pending", feedback: "" };

  const updateReview = (filename: string, update: Partial<TrialReview>) => {
    setReviewData((prev) => ({
      ...prev,
      [filename]: { ...getReview(filename), ...update },
    }));
  };

  const saveReview = async () => {
    setSaving(true);
    await fetch("/api/review/trials/save-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    setSaving(false);
  };

  const uploadFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          await fetch("/api/review/references/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name, data: base64 }),
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    loadReferences();
  };

  const deleteReference = async (filename: string) => {
    if (!confirm(`"${filename}" 삭제?`)) return;
    await fetch("/api/review/references/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    loadReferences();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  const navigatePreview = (dir: 1 | -1) => {
    if (!previewImage) return;
    const list = trials.some(t => t.filename === previewImage.filename) ? trials : references;
    const idx = list.findIndex(f => f.filename === previewImage.filename);
    if (idx < 0) return;
    setPreviewImage(list[(idx + dir + list.length) % list.length]);
  };

  const approvedCount = trials.filter((t) => getReview(t.filename).status === "approved").length;
  const gatePass = trials.length > 0 && approvedCount >= Math.ceil(trials.length * 0.8);

  const getBgColor = () => {
    switch (previewBg) {
      case "light": return "#f0f0f0";
      case "checker": return "#808080";
      default: return "#1a1a2e";
    }
  };

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
      {/* ── Trial Review Section ── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>트라이얼 검수</h2>
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
            승인 {approvedCount}/{trials.length}
          </span>
          <span
            style={{
              fontSize: 12,
              padding: "3px 10px",
              borderRadius: 12,
              fontWeight: 600,
              background: gatePass ? "var(--green)" : "var(--bg-tertiary)",
              color: gatePass ? "#000" : "var(--text-muted)",
            }}
          >
            Gate: {gatePass ? "PASS" : "FAIL"}
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={saveReview}
            disabled={saving}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              fontWeight: 600,
              background: "var(--accent)",
              color: "#000",
              border: "none",
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "저장 중..." : "검수 결과 저장"}
          </button>
        </div>

        {trials.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            트라이얼 이미지 없음 (experiment/outputs/trial/)
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {trials.map((trial) => {
              const review = getReview(trial.filename);
              return (
                <div
                  key={trial.filename}
                  style={{
                    border: `2px solid ${
                      review.status === "approved"
                        ? "var(--green)"
                        : review.status === "rejected"
                          ? "#e74c3c"
                          : "var(--border)"
                    }`,
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <div
                    style={{ position: "relative", background: "#1a1a2e", padding: 8, cursor: "pointer" }}
                    onClick={() => setPreviewImage(trial)}
                  >
                    <img
                      src={`/api/review/image?path=${encodeURIComponent(trial.path)}`}
                      alt={trial.filename}
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "rgba(0,0,0,0.6)",
                        color: "#aaa",
                      }}
                    >
                      클릭하여 미리보기
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, wordBreak: "break-all" }}>
                      {trial.filename}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <button
                        onClick={() => updateReview(trial.filename, { status: review.status === "approved" ? "pending" : "approved" })}
                        style={{
                          flex: 1,
                          padding: "5px 0",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                          fontSize: 13,
                          cursor: "pointer",
                          background: review.status === "approved" ? "var(--green)" : "var(--bg-tertiary)",
                          color: review.status === "approved" ? "#000" : "var(--text-secondary)",
                          fontWeight: review.status === "approved" ? 600 : 400,
                        }}
                      >
                        ✅ 승인
                      </button>
                      <button
                        onClick={() => updateReview(trial.filename, { status: review.status === "rejected" ? "pending" : "rejected" })}
                        style={{
                          flex: 1,
                          padding: "5px 0",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                          fontSize: 13,
                          cursor: "pointer",
                          background: review.status === "rejected" ? "#e74c3c" : "var(--bg-tertiary)",
                          color: review.status === "rejected" ? "#fff" : "var(--text-secondary)",
                          fontWeight: review.status === "rejected" ? 600 : 400,
                        }}
                      >
                        ❌ 거부
                      </button>
                    </div>
                    <input
                      value={review.feedback}
                      onChange={(e) => updateReview(trial.filename, { feedback: e.target.value })}
                      placeholder="피드백..."
                      style={{
                        width: "100%",
                        padding: "5px 8px",
                        fontSize: 12,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Character POC Section ── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>캐릭터 POC</h2>
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {characters.filter((c) => c.type === "json").length} Lottie
          </span>
        </div>

        {characters.filter((c) => c.type === "json").length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            캐릭터 Lottie 없음 (experiment/outputs/character/*.json)
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {characters.filter((c) => c.type === "json").map((char) => (
              <div
                key={char.filename}
                style={{
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  background: "var(--bg-secondary)",
                }}
              >
                <div style={{ background: "#1a1a2e" }}>
                  <Player
                    component={LottiePreviewComposition}
                    inputProps={{
                      lottieUrl: `/api/review/image?path=${encodeURIComponent(char.path)}`,
                      bgColor: "#1a1a2e",
                    }}
                    durationInFrames={90}
                    fps={30}
                    compositionWidth={400}
                    compositionHeight={400}
                    loop
                    autoPlay
                    style={{ width: "100%", height: 300, borderRadius: 0 }}
                  />
                </div>
                <div style={{ padding: "8px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, wordBreak: "break-all" }}>
                    {char.filename}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {(char.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Reference Section ── */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>레퍼런스</h2>
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {references.length}장
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: 12,
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            파일 선택
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            padding: dragOver ? 20 : 0,
            marginBottom: 16,
            textAlign: "center",
            transition: "all 0.15s",
            background: dragOver ? "rgba(255,255,255,0.03)" : "transparent",
            minHeight: dragOver ? 60 : 0,
            overflow: "hidden",
          }}
        >
          {dragOver && (
            <div style={{ color: "var(--accent)", fontSize: 14, fontWeight: 600, padding: 12 }}>
              여기에 이미지를 놓으세요
            </div>
          )}
        </div>

        {references.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            레퍼런스 이미지 없음 (experiment/reference/collected/)
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {references.map((ref) => (
              <div
                key={ref.filename}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  background: "var(--bg-secondary)",
                  position: "relative",
                }}
              >
                <img
                  src={`/api/review/image?path=${encodeURIComponent(ref.path)}`}
                  alt={ref.filename}
                  onClick={() => setPreviewImage(ref)}
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    display: "block",
                    cursor: "pointer",
                  }}
                />
                <div style={{ padding: "6px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      fontSize: 10,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--text-muted)",
                    }}
                    title={ref.filename}
                  >
                    {ref.filename}
                  </span>
                  <button
                    onClick={() => deleteReference(ref.filename)}
                    style={{
                      fontSize: 10,
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "2px 4px",
                      flexShrink: 0,
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Remotion Player Preview Modal ── */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setPreviewImage(null);
            if (e.key === "ArrowLeft") navigatePreview(-1);
            if (e.key === "ArrowRight") navigatePreview(1);
          }}
          tabIndex={0}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            outline: "none",
          }}
          ref={(el) => el?.focus()}
        >
          {/* Motion preset toolbar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 16,
              padding: "8px 16px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 24,
              cursor: "default",
              alignItems: "center",
            }}
          >
            {MOTION_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPreviewMotion(p.key)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 14,
                  border: "none",
                  fontSize: 12,
                  fontWeight: previewMotion === p.key ? 700 : 400,
                  background: previewMotion === p.key ? "var(--accent, #f0c040)" : "transparent",
                  color: previewMotion === p.key ? "#000" : "#ccc",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {p.label}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)", margin: "0 4px" }} />
            {(["dark", "light", "checker"] as const).map((bg) => (
              <button
                key={bg}
                onClick={() => setPreviewBg(bg)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  border: previewBg === bg ? "2px solid var(--accent, #f0c040)" : "2px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  ...(bg === "dark" ? { background: "#1a1a2e" } :
                    bg === "light" ? { background: "#f0f0f0" } :
                    { background: "repeating-conic-gradient(#808080 0% 25%, #a0a0a0 0% 50%) 0 0 / 8px 8px" }),
                }}
                title={bg === "dark" ? "어두운 배경" : bg === "light" ? "밝은 배경" : "체커보드"}
              />
            ))}
          </div>

          {/* Remotion Player */}
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "default", borderRadius: 12, overflow: "hidden" }}>
            <Player
              component={AssetPreviewComposition}
              inputProps={{
                imageUrl: `/api/review/image?path=${encodeURIComponent(previewImage.path)}`,
                motion: previewMotion,
                bgColor: getBgColor(),
              }}
              durationInFrames={150}
              fps={30}
              compositionWidth={500}
              compositionHeight={500}
              loop
              autoPlay
              style={{
                width: 500,
                height: 500,
                borderRadius: 12,
              }}
              controls
            />
          </div>

          {/* Navigation */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginTop: 16,
              cursor: "default",
            }}
          >
            <button
              onClick={() => navigatePreview(-1)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: 20,
                width: 36,
                height: 36,
                fontSize: 18,
                color: "#ccc",
                cursor: "pointer",
              }}
            >
              ←
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                {previewImage.filename}
              </div>
              <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                {(previewImage.size / 1024).toFixed(1)} KB · ESC 닫기 · ←→ 탐색
              </div>
            </div>
            <button
              onClick={() => navigatePreview(1)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: 20,
                width: 36,
                height: 36,
                fontSize: 18,
                color: "#ccc",
                cursor: "pointer",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
