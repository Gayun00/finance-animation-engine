/**
 * Asset Matcher — maps narration keywords to asset registry tags.
 *
 * Given narration text, returns a ranked list of matching assets
 * that can be used by the Scene Composer.
 */

export interface AssetEntry {
  id: string;
  file: string; // path under public/animations/
  tags: string[];
  category: "icon" | "chart" | "effect" | "character" | "decoration";
}

export interface AssetMatch {
  asset: AssetEntry;
  score: number;
}

// ── Asset Registry ──

export const ASSET_REGISTRY: AssetEntry[] = [
  {
    id: "coins_drop",
    file: "Coins drop.json",
    tags: ["돈", "코인", "투자", "원금", "금액", "자산", "money", "coin", "invest"],
    category: "icon",
  },
  {
    id: "coin_3d",
    file: "Fake 3D vector coin.json",
    tags: ["코인", "동전", "원", "화폐", "coin", "currency"],
    category: "icon",
  },
  {
    id: "growth_chart",
    file: "Growth Chart.json",
    tags: ["성장", "그래프", "차트", "상승", "증가", "복리", "growth", "chart", "compound"],
    category: "chart",
  },
  {
    id: "financial_graph",
    file: "Financial Graph Loader.json",
    tags: ["그래프", "차트", "데이터", "통계", "graph", "chart", "data", "finance"],
    category: "chart",
  },
  {
    id: "graph_loader",
    file: "graph loader.json",
    tags: ["그래프", "로딩", "차트", "graph", "loader"],
    category: "chart",
  },
  {
    id: "money_transfer",
    file: "Money Transfer.json",
    tags: ["송금", "이체", "돈", "이동", "전송", "transfer", "money", "payment"],
    category: "icon",
  },
  {
    id: "money_icon",
    file: "Money.json",
    tags: ["돈", "지폐", "현금", "수익", "이자", "money", "cash", "profit", "interest"],
    category: "icon",
  },
  {
    id: "conversation",
    file: "Conversation Two Friend & Get Idea.json",
    tags: ["대화", "아이디어", "설명", "사람", "토론", "idea", "explain", "talk", "person"],
    category: "character",
  },
  {
    id: "lightbulb",
    file: "lightbulb.json",
    tags: ["아이디어", "인사이트", "핵심", "팁", "깨달음", "idea", "insight", "tip", "lightbulb"],
    category: "icon",
  },
  {
    id: "confetti",
    file: "confetti.json",
    tags: ["축하", "완료", "엔딩", "마무리", "celebration", "ending", "outro", "congrats"],
    category: "effect",
  },
  {
    id: "gold_sparkle",
    file: "gold-sparkle.json",
    tags: ["반짝", "효과", "금", "sparkle", "gold", "effect", "shine"],
    category: "decoration",
  },
  {
    id: "arrows",
    file: "Arrows.json",
    tags: ["방향", "화살표", "증가", "감소", "변화", "arrow", "direction", "change"],
    category: "icon",
  },
  {
    id: "analysis",
    file: "Analysis.json",
    tags: ["분석", "비교", "검토", "리서치", "analysis", "compare", "research"],
    category: "icon",
  },
];

// ── Keyword Matching ──

/**
 * Match assets against narration text using keyword overlap scoring.
 */
export function matchAssets(
  narration: string,
  options?: {
    category?: AssetEntry["category"];
    maxResults?: number;
    excludeIds?: string[];
  }
): AssetMatch[] {
  const text = narration.toLowerCase();
  const max = options?.maxResults ?? 5;

  const results: AssetMatch[] = [];

  for (const asset of ASSET_REGISTRY) {
    if (options?.category && asset.category !== options.category) continue;
    if (options?.excludeIds?.includes(asset.id)) continue;

    let score = 0;
    for (const tag of asset.tags) {
      if (text.includes(tag.toLowerCase())) {
        // Korean tags get slightly higher weight (more specific)
        score += /[\u3131-\uD79D]/.test(tag) ? 2 : 1;
      }
    }

    if (score > 0) {
      results.push({ asset, score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, max);
}

/**
 * Find the single best-matching asset for a given narration and category.
 */
export function findBestAsset(
  narration: string,
  category?: AssetEntry["category"],
  excludeIds?: string[]
): AssetEntry | null {
  const matches = matchAssets(narration, {
    category,
    maxResults: 1,
    excludeIds,
  });
  return matches[0]?.asset ?? null;
}

/**
 * Map section type to recommended asset categories.
 */
export const SECTION_ASSET_HINTS: Record<string, AssetEntry["category"][]> = {
  intro: ["icon", "decoration", "effect"],
  explain: ["character", "icon"],
  chart: ["chart", "icon"],
  comparison: ["icon", "chart"],
  callout: ["icon", "decoration"],
  outro: ["effect", "decoration"],
};
