import React, { useMemo, useState, useCallback } from "react";
import { useBuilderStore } from "../state/builder-store";
import { getPresetById } from "../data/preset-registry";
import { ASSET_CATALOG, refreshCatalog, type AssetEntry } from "../data/asset-catalog";
import type { AssetCategory } from "../types/preset-meta";

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  background: "배경",
  element: "요소",
  character: "캐릭터",
  effect: "이펙트",
  emoji: "이모지",
};

export const AssetPicker: React.FC = () => {
  const selectedIndex = useBuilderStore((s) => s.selectedSceneIndex);
  const scenes = useBuilderStore((s) => s.scenes);
  const activeSlotId = useBuilderStore((s) => s.activeSlotId);
  const assignAsset = useBuilderStore((s) => s.assignAsset);
  const setActiveSlot = useBuilderStore((s) => s.setActiveSlot);

  // bump to force re-render after catalog refresh
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCatalog();
      setCatalogVersion((v) => v + 1);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const scene = selectedIndex !== null ? scenes[selectedIndex] : null;
  const preset = scene ? getPresetById(scene.presetId) : null;
  const slot = preset?.slots.find((s) => s.id === activeSlotId);

  const grouped = useMemo(() => {
    if (!slot) return {};
    const allowed = slot.allowedCategories;
    const groups: Record<string, AssetEntry[]> = {};
    for (const asset of ASSET_CATALOG) {
      if (!allowed.includes(asset.category)) continue;
      const cat = CATEGORY_LABELS[asset.category] || asset.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(asset);
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot, catalogVersion]);

  if (!slot || selectedIndex === null) {
    return (
      <div
        style={{
          width: 280,
          minWidth: 280,
          borderLeft: "1px solid var(--border)",
          padding: 20,
          color: "var(--text-muted)",
          fontSize: 12,
          textAlign: "center",
          paddingTop: 60,
        }}
      >
        슬롯을 클릭하면<br />에셋을 선택할 수 있습니다
      </div>
    );
  }

  const currentAssetId = scene?.slotAssignments[slot.id];
  const suggested = slot.suggestedAssetIds ?? [];

  return (
    <div
      style={{
        width: 280,
        minWidth: 280,
        borderLeft: "1px solid var(--border)",
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{slot.label}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {slot.description}
          </div>
        </div>
        <button
          onClick={() => setActiveSlot(null)}
          style={{ fontSize: 12, padding: "4px 8px", borderRadius: 4, background: "var(--bg-tertiary)" }}
        >
          ✕
        </button>
      </div>

      {/* Clear button */}
      {currentAssetId && (
        <button
          onClick={() => assignAsset(selectedIndex, slot.id, null)}
          style={{
            margin: "8px 12px 0",
            padding: "8px",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-tertiary)",
            color: "var(--red)",
            fontSize: 12,
            border: "1px solid var(--border)",
          }}
        >
          비우기
        </button>
      )}

      {/* Suggested */}
      {suggested.length > 0 && (
        <div style={{ padding: "12px 12px 4px" }}>
          <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6, fontWeight: 600 }}>
            추천
          </div>
          {suggested.map((sid) => {
            const asset = ASSET_CATALOG.find((a) => a.id === sid);
            if (!asset) return null;
            const isActive = currentAssetId === sid;
            return (
              <AssetButton
                key={sid}
                asset={asset}
                isActive={isActive}
                onClick={() => assignAsset(selectedIndex, slot.id, sid)}
              />
            );
          })}
        </div>
      )}

      {/* All by category */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {ASSET_CATALOG.length}개 에셋
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 4,
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              opacity: refreshing ? 0.5 : 1,
            }}
          >
            {refreshing ? "스캔 중..." : "새 에셋 추가"}
          </button>
        </div>
        {Object.entries(grouped).map(([cat, assets]) => (
          <div key={cat} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600 }}>
              {cat}
            </div>
            {assets.map((asset) => (
              <AssetButton
                key={asset.id}
                asset={asset}
                isActive={currentAssetId === asset.id}
                onClick={() => assignAsset(selectedIndex, slot.id, asset.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const AssetButton: React.FC<{
  asset: AssetEntry;
  isActive: boolean;
  onClick: () => void;
}> = ({ asset, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "8px 10px",
      borderRadius: "var(--radius-sm)",
      marginBottom: 3,
      background: isActive ? "var(--bg-tertiary)" : "transparent",
      border: isActive ? "1px solid var(--accent)" : "1px solid transparent",
      transition: "all 0.1s",
      fontSize: 13,
    }}
    onMouseEnter={(e) => {
      if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
    }}
    onMouseLeave={(e) => {
      if (!isActive) e.currentTarget.style.background = "transparent";
    }}
  >
    <span style={{ fontWeight: isActive ? 600 : 400 }}>{asset.name}</span>
    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>
      {asset.category}
    </span>
  </button>
);
