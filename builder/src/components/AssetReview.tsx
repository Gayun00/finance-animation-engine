import React, { useEffect, useState, useCallback, useRef } from "react";

interface ImageFile {
  filename: string;
  path: string;
  size: number;
  mtime: number;
}

interface TrialReview {
  status: "approved" | "rejected" | "pending";
  feedback: string;
}

type ReviewData = Record<string, TrialReview>;

export const AssetReview: React.FC = () => {
  const [references, setReferences] = useState<ImageFile[]>([]);
  const [trials, setTrials] = useState<ImageFile[]>([]);
  const [reviewData, setReviewData] = useState<ReviewData>({});
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReferences = useCallback(async () => {
    const res = await fetch("/api/review/references");
    setReferences(await res.json());
  }, []);

  const loadTrials = useCallback(async () => {
    const res = await fetch("/api/review/trials");
    setTrials(await res.json());
  }, []);

  const loadReview = useCallback(async () => {
    const res = await fetch("/api/review/trials/load-review");
    const data = await res.json();
    if (data && typeof data === "object") setReviewData(data);
  }, []);

  useEffect(() => {
    loadReferences();
    loadTrials();
    loadReview();
  }, [loadReferences, loadTrials, loadReview]);

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

  const approvedCount = trials.filter((t) => getReview(t.filename).status === "approved").length;
  const gatePass = trials.length > 0 && approvedCount >= Math.ceil(trials.length * 0.8);

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240, 1fr))", gap: 16 }}>
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
                  <div style={{ position: "relative", background: "#1a1a2e", padding: 8 }}>
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
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    display: "block",
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
    </div>
  );
};
