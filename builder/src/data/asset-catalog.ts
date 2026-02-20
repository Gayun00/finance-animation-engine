import type { AssetCategory } from "../types/preset-meta";

export interface AssetEntry {
  id: string;
  file: string;
  name: string;
  tags: string[];
  category: AssetCategory;
}

export let ASSET_CATALOG: AssetEntry[] = [
  // Money & Finance
  { id: "coins_drop", file: "element/Coins drop.json", name: "코인 낙하", tags: ["돈","코인","투자"], category: "element" },
  { id: "coin_3d", file: "element/Fake 3D vector coin.json", name: "3D 코인", tags: ["코인","동전"], category: "element" },
  { id: "coin_spin", file: "element/coin-spin.json", name: "코인 회전", tags: ["코인","회전","돈"], category: "element" },
  { id: "money_transfer", file: "element/Money Transfer.json", name: "송금", tags: ["송금","이체","돈"], category: "element" },
  { id: "money_icon", file: "element/Money.json", name: "지폐", tags: ["돈","지폐","현금","수익"], category: "element" },
  { id: "company_revenue", file: "element/Company Revenue.json", name: "매출", tags: ["매출","수익","기업"], category: "element" },

  // Charts & Data
  { id: "growth_chart", file: "element/Growth Chart.json", name: "성장 차트", tags: ["성장","그래프","차트"], category: "element" },
  { id: "growth_arrow", file: "element/growth-arrow.json", name: "성장 화살표", tags: ["성장","화살표","상승"], category: "element" },
  { id: "financial_graph", file: "element/Financial Graph Loader.json", name: "금융 그래프", tags: ["그래프","차트","데이터"], category: "element" },
  { id: "graph_loader", file: "element/graph loader.json", name: "그래프 로더", tags: ["그래프","로딩","차트"], category: "element" },
  { id: "analysis", file: "element/Analysis.json", name: "분석", tags: ["분석","비교","검토"], category: "element" },
  { id: "arrows", file: "element/Arrows.json", name: "화살표", tags: ["방향","화살표","변화"], category: "element" },

  // Space & Planets
  { id: "rocket_ufo", file: "element/Rocket in space with the UFO.json", name: "로켓 & UFO", tags: ["우주","로켓","발사"], category: "element" },
  { id: "planet", file: "element/Planet.json", name: "행성", tags: ["행성","우주","세계"], category: "element" },
  { id: "orbit_planet", file: "element/Orbit Planet.json", name: "궤도 행성", tags: ["궤도","행성","우주"], category: "element" },
  { id: "earth", file: "element/Earth.json", name: "지구", tags: ["지구","세계","글로벌"], category: "element" },

  // Companies & Business
  { id: "tesla", file: "element/Tesla Company.json", name: "테슬라", tags: ["테슬라","기업"], category: "element" },
  { id: "stripe", file: "element/Stripe.json", name: "스트라이프", tags: ["스트라이프","결제"], category: "element" },
  { id: "gemini", file: "element/Gemini Logo.json", name: "제미니", tags: ["AI","기업","로고"], category: "element" },
  { id: "adidas_shoes", file: "element/Adidas Shoes.json", name: "아디다스", tags: ["아디다스","브랜드"], category: "element" },
  { id: "ai_company_logo", file: "element/Ai Company Logo.json", name: "AI 로고", tags: ["AI","인공지능","로고"], category: "element" },
  { id: "company_business", file: "element/Company Business.json", name: "비즈니스", tags: ["기업","비즈니스","사업"], category: "element" },
  { id: "company_culture", file: "element/Company Culture.json", name: "기업 문화", tags: ["기업","문화","팀"], category: "element" },
  { id: "company_folder", file: "element/Company Folder.json", name: "폴더", tags: ["기업","폴더","자료"], category: "element" },
  { id: "constructions_houses", file: "element/Constructions Houses.json", name: "건설 주택", tags: ["건설","주택","부동산","건물"], category: "element" },
  { id: "modern_buildings", file: "element/Modern Buildings.json", name: "현대 빌딩", tags: ["빌딩","건물","도시","부동산"], category: "element" },

  // Characters
  { id: "bearded_man_walking", file: "character/Bearded Man Walking.json", name: "걷는 남자", tags: ["사람","걷기","남자"], category: "character" },
  { id: "girl_skateboard", file: "character/girl skating on skateboard.json", name: "스케이트보드 소녀", tags: ["소녀","스케이트보드"], category: "character" },
  { id: "spaceman_ship", file: "character/Spaceman In Ship.json", name: "우주인", tags: ["우주","우주인","탐험"], category: "character" },
  { id: "conversation", file: "character/Conversation Two Friend & Get Idea.json", name: "대화 & 아이디어", tags: ["대화","아이디어","사람"], category: "character" },

  // Ideas
  { id: "lightbulb", file: "element/lightbulb.json", name: "전구", tags: ["아이디어","인사이트","팁"], category: "element" },

  // Backgrounds
  { id: "cityscape_night", file: "background/Cityscape at night.json", name: "도시 야경", tags: ["도시","야경","배경"], category: "background" },
  { id: "abstract_bg", file: "background/Abstract Background.json", name: "추상 배경", tags: ["배경","추상"], category: "background" },
  { id: "bg_lines", file: "background/Background Lines.json", name: "라인 배경", tags: ["배경","라인","흐름"], category: "background" },

  // Emoji
  { id: "love_emoji", file: "emoji/Love Emoji.json", name: "하트", tags: ["사랑","하트","좋아요"], category: "emoji" },
  { id: "brain_explosion_emoji", file: "emoji/Brain Explosion Emoji.json", name: "뇌 폭발", tags: ["충격","놀라움","대박"], category: "emoji" },

  // Effects
  { id: "confetti", file: "effect/confetti.json", name: "컨페티", tags: ["축하","완료","엔딩"], category: "effect" },
  { id: "gold_sparkle", file: "effect/gold-sparkle.json", name: "금빛 반짝", tags: ["반짝","효과","금"], category: "effect" },
  { id: "shine_star", file: "effect/Shine Star.json", name: "빛나는 별", tags: ["반짝","별","빛"], category: "effect" },
];

export function getAssetsByCategory(category: AssetCategory): AssetEntry[] {
  return ASSET_CATALOG.filter((a) => a.category === category);
}

export function getAssetById(id: string): AssetEntry | undefined {
  return ASSET_CATALOG.find((a) => a.id === id);
}

/** Scan the animations directory and ADD only new (unregistered) files. Returns number of newly added. */
export async function refreshCatalog(): Promise<number> {
  const res = await fetch("/api/assets/scan");
  const scanned: AssetEntry[] = await res.json();
  const existingFiles = new Set(ASSET_CATALOG.map((a) => a.file));
  const newEntries = scanned.filter((a) => !existingFiles.has(a.file));
  if (newEntries.length > 0) {
    ASSET_CATALOG = [...ASSET_CATALOG, ...newEntries];
  }
  return newEntries.length;
}
