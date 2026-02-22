/**
 * 실험 A: API 비교를 위한 공통 프롬프트 정의
 */

export const STYLE_PREFIX = `Flat vector icon, Kurzgesagt animation style.
Dark navy background (#1B2838). Simple geometric shapes, no outlines, no text.
Soft glow effect. Clean and minimal. Suitable for motion graphics overlay.`;

export interface IconPrompt {
  id: string;
  name: string;
  description: string;
  colors: string;
}

export const TEST_ICONS: IconPrompt[] = [
  {
    id: "icon_gold_coin",
    name: "금화",
    description: "A shining gold coin with a subtle star emblem in the center",
    colors: "gold #FFB74D, highlight #FFD54F",
  },
  {
    id: "icon_chart_up",
    name: "상승 차트",
    description: "An upward trending line chart with glowing data points",
    colors: "mint green #81C784, grid lines #2A4157",
  },
  {
    id: "icon_piggy_bank",
    name: "저금통",
    description: "A cute geometric piggy bank with a coin slot on top",
    colors: "pink #F06292, coin slot #FFD54F",
  },
  {
    id: "icon_money_stack",
    name: "지폐 묶음",
    description: "A neat stack of paper bills held together with a band",
    colors: "green #81C784, band #FFB74D",
  },
  {
    id: "icon_percent",
    name: "상승 퍼센트",
    description: "A percent symbol with an upward arrow, representing growth",
    colors: "cyan #4FC3F7, arrow #FFD54F",
  },
];

/** 풀 프롬프트 조합: STYLE_PREFIX + 아이콘 설명 + 색상 */
export function buildPrompt(icon: IconPrompt): string {
  return `${STYLE_PREFIX}\n\nIcon: ${icon.description}.\nColor palette: ${icon.colors}.`;
}
