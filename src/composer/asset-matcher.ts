/**
 * Asset Matcher — maps narration keywords to asset registry tags.
 *
 * Given narration text, returns a ranked list of matching assets
 * that can be used by the Scene Composer.
 */

export interface AssetEntry {
  id: string;
  file: string; // path under public/animations/ (includes category folder)
  tags: string[];
  category: "background" | "effect" | "element" | "emoji" | "character";
}

export interface AssetMatch {
  asset: AssetEntry;
  score: number;
}

// ── Asset Registry ──

export const ASSET_REGISTRY: AssetEntry[] = [
  // ── Money & Finance ──
  {
    id: "coins_drop",
    file: "element/Coins drop.json",
    tags: ["돈", "코인", "투자", "원금", "금액", "자산", "money", "coin", "invest"],
    category: "element",
  },
  {
    id: "coin_3d",
    file: "element/Fake 3D vector coin.json",
    tags: ["코인", "동전", "원", "화폐", "coin", "currency"],
    category: "element",
  },
  {
    id: "coin_spin",
    file: "element/coin-spin.json",
    tags: ["코인", "동전", "회전", "돈", "coin", "spin", "money"],
    category: "element",
  },
  {
    id: "money_transfer",
    file: "element/Money Transfer.json",
    tags: ["송금", "이체", "돈", "이동", "전송", "흐름", "transfer", "money", "payment"],
    category: "element",
  },
  {
    id: "money_icon",
    file: "element/Money.json",
    tags: ["돈", "지폐", "현금", "수익", "이자", "매출", "money", "cash", "profit", "interest", "revenue"],
    category: "element",
  },
  {
    id: "company_revenue",
    file: "element/Company Revenue.json",
    tags: ["매출", "수익", "성장률", "기업", "revenue", "profit", "growth", "company", "chart"],
    category: "element",
  },

  // ── Charts & Data ──
  {
    id: "growth_chart",
    file: "element/Growth Chart.json",
    tags: ["성장", "그래프", "차트", "상승", "증가", "복리", "시장", "규모", "growth", "chart", "compound", "market"],
    category: "element",
  },
  {
    id: "growth_arrow",
    file: "element/growth-arrow.json",
    tags: ["성장", "화살표", "상승", "증가", "growth", "arrow", "up"],
    category: "element",
  },
  {
    id: "financial_graph",
    file: "element/Financial Graph Loader.json",
    tags: ["그래프", "차트", "데이터", "통계", "graph", "chart", "data", "finance"],
    category: "element",
  },
  {
    id: "graph_loader",
    file: "element/graph loader.json",
    tags: ["그래프", "로딩", "차트", "비교", "graph", "loader", "chart"],
    category: "element",
  },
  {
    id: "analysis",
    file: "element/Analysis.json",
    tags: ["분석", "비교", "검토", "수익률", "analysis", "compare", "research"],
    category: "element",
  },
  {
    id: "arrows",
    file: "element/Arrows.json",
    tags: ["방향", "화살표", "증가", "감소", "변화", "우상향", "arrow", "direction", "change"],
    category: "element",
  },

  // ── Space & Planets ──
  {
    id: "rocket_ufo",
    file: "element/Rocket in space with the UFO.json",
    tags: ["우주", "로켓", "발사", "산업", "space", "rocket", "launch"],
    category: "element",
  },
  {
    id: "spaceman_ship",
    file: "character/Spaceman In Ship.json",
    tags: ["우주", "우주인", "탐험", "진입", "spaceman", "ship", "space"],
    category: "character",
  },
  {
    id: "planet",
    file: "element/Planet.json",
    tags: ["행성", "우주", "지구", "세계", "planet", "space", "earth", "world"],
    category: "element",
  },
  {
    id: "orbit_planet",
    file: "element/Orbit Planet.json",
    tags: ["궤도", "행성", "우주", "orbit", "planet", "space"],
    category: "element",
  },
  {
    id: "earth",
    file: "element/Earth.json",
    tags: ["지구", "세계", "글로벌", "인류", "earth", "world", "global"],
    category: "element",
  },

  // ── Companies & Business ──
  {
    id: "tesla",
    file: "element/Tesla Company.json",
    tags: ["테슬라", "기업", "회사", "tesla", "company"],
    category: "element",
  },
  {
    id: "stripe",
    file: "element/Stripe.json",
    tags: ["스트라이프", "결제", "stripe", "payment"],
    category: "element",
  },
  {
    id: "gemini",
    file: "element/Gemini Logo.json",
    tags: ["AI", "기업", "로고", "gemini", "ai", "logo"],
    category: "element",
  },
  {
    id: "adidas_shoes",
    file: "element/Adidas Shoes.json",
    tags: ["아디다스", "신발", "브랜드", "adidas", "shoes", "brand"],
    category: "element",
  },
  {
    id: "ai_company_logo",
    file: "element/Ai Company Logo.json",
    tags: ["AI", "인공지능", "기업", "로고", "ai", "company", "logo"],
    category: "element",
  },
  {
    id: "company_business",
    file: "element/Company Business.json",
    tags: ["기업", "비즈니스", "사업", "회사", "산업", "company", "business"],
    category: "element",
  },
  {
    id: "company_culture",
    file: "element/Company Culture.json",
    tags: ["기업", "문화", "팀", "company", "culture"],
    category: "element",
  },
  {
    id: "company_folder",
    file: "element/Company Folder.json",
    tags: ["기업", "폴더", "자료", "문서", "company", "folder", "document"],
    category: "element",
  },

  // ── People & Characters ──
  {
    id: "bearded_man_walking",
    file: "character/Bearded Man Walking.json",
    tags: ["사람", "걷기", "남자", "걸어가는", "person", "walk", "man", "walking"],
    category: "character",
  },
  {
    id: "girl_skateboard",
    file: "character/girl skating on skateboard.json",
    tags: ["소녀", "스케이트보드", "움직임", "활동", "girl", "skateboard", "skating", "action"],
    category: "character",
  },
  {
    id: "conversation",
    file: "character/Conversation Two Friend & Get Idea.json",
    tags: ["대화", "아이디어", "설명", "사람", "투자자", "선택", "idea", "explain", "talk", "person"],
    category: "character",
  },

  // ── Ideas ──
  {
    id: "lightbulb",
    file: "element/lightbulb.json",
    tags: ["아이디어", "인사이트", "핵심", "팁", "깨달음", "타이밍", "골든타임", "idea", "insight", "tip"],
    category: "element",
  },

  // ── Backgrounds ──
  {
    id: "cityscape_night",
    file: "background/Cityscape at night.json",
    tags: ["도시", "야경", "밤", "배경", "건물", "스카이라인", "city", "cityscape", "night", "skyline", "background"],
    category: "background",
  },
  {
    id: "abstract_bg",
    file: "background/Abstract Background.json",
    tags: ["배경", "추상", "시대", "background", "abstract"],
    category: "background",
  },
  {
    id: "bg_lines",
    file: "background/Background Lines.json",
    tags: ["배경", "라인", "흐름", "background", "lines", "flow"],
    category: "background",
  },

  // ── Emoji ──
  {
    id: "love_emoji",
    file: "emoji/Love Emoji.json",
    tags: ["사랑", "하트", "좋아요", "감정", "love", "heart", "like", "emoji"],
    category: "emoji",
  },
  {
    id: "brain_explosion_emoji",
    file: "emoji/Brain Explosion Emoji.json",
    tags: ["충격", "놀라움", "폭발", "두뇌", "대박", "brain", "explosion", "shock", "wow", "emoji"],
    category: "emoji",
  },

  // ── Effects ──
  {
    id: "confetti",
    file: "effect/confetti.json",
    tags: ["축하", "완료", "엔딩", "마무리", "응원", "celebration", "ending", "outro", "congrats"],
    category: "effect",
  },
  {
    id: "gold_sparkle",
    file: "effect/gold-sparkle.json",
    tags: ["반짝", "효과", "금", "sparkle", "gold", "effect", "shine"],
    category: "effect",
  },
  {
    id: "shine_star",
    file: "effect/Shine Star.json",
    tags: ["반짝", "별", "빛", "효과", "shine", "star", "sparkle", "glow", "effect"],
    category: "effect",
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
  intro: ["element", "background", "effect"],
  explain: ["character", "element"],
  chart: ["element"],
  comparison: ["element"],
  callout: ["element", "effect"],
  outro: ["effect", "background"],
};
