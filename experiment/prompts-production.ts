/**
 * 실험 C: Production 아이콘 30종 정의
 * 6개 카테고리 × 4~6개
 */

import { IconPrompt } from "./prompts";

export const PRODUCTION_ICONS: IconPrompt[] = [
  // === 돈/자산 (6) ===
  {
    id: "coin_gold",
    name: "금화",
    description: "A shining gold coin with a subtle star emblem",
    colors: "gold #FFB74D, highlight #FFD54F",
  },
  {
    id: "coin_silver",
    name: "은화",
    description: "A silver coin with a diamond emblem",
    colors: "silver #B0BEC5, highlight #ECEFF1",
  },
  {
    id: "bills_stack",
    name: "지폐 묶음",
    description: "A neat stack of paper bills held together with a band",
    colors: "green #81C784, band #FFB74D",
  },
  {
    id: "money_bag",
    name: "돈 자루",
    description: "A round money bag with a dollar sign",
    colors: "brown #8D6E63, dollar sign #FFD54F",
  },
  {
    id: "wallet",
    name: "지갑",
    description: "An open wallet with cards and bills peeking out",
    colors: "brown #8D6E63, card #42A5F5, bills #81C784",
  },
  {
    id: "credit_card",
    name: "신용카드",
    description: "A credit card with a chip and magnetic stripe",
    colors: "blue #42A5F5, chip #FFD54F, stripe #B0BEC5",
  },

  // === 차트/데이터 (4) ===
  {
    id: "chart_line_up",
    name: "상승 라인 차트",
    description: "An upward trending line chart with glowing data points",
    colors: "mint green #81C784, grid #2A4157",
  },
  {
    id: "chart_line_down",
    name: "하락 라인 차트",
    description: "A downward trending line chart with data points",
    colors: "red #EF5350, grid #2A4157",
  },
  {
    id: "chart_bar",
    name: "막대 차트",
    description: "Three ascending bar chart columns with varying heights",
    colors: "purple #AB47BC, bars #CE93D8",
  },
  {
    id: "chart_pie",
    name: "원형 차트",
    description: "A pie chart divided into three colored segments",
    colors: "teal #26A69A, orange #FFB74D, pink #F06292",
  },

  // === 금융 개념 (6) ===
  {
    id: "percent_up",
    name: "상승 퍼센트",
    description: "A percent symbol with an upward arrow",
    colors: "cyan #4FC3F7, arrow #FFD54F",
  },
  {
    id: "percent_down",
    name: "하락 퍼센트",
    description: "A percent symbol with a downward arrow",
    colors: "red #EF5350, arrow #FFD54F",
  },
  {
    id: "piggy_bank",
    name: "저금통",
    description: "A cute geometric piggy bank with a coin slot on top",
    colors: "pink #F06292, coin slot #FFD54F",
  },
  {
    id: "bank_building",
    name: "은행 건물",
    description:
      "A simple rounded bank building with columns, using organic shapes",
    colors: "white #E0E0E0, columns #B0BEC5, accent #FFD54F",
  },
  {
    id: "safe_box",
    name: "금고",
    description: "A sturdy safe box with a combination dial",
    colors: "gray #78909C, dial #FFD54F, handle #B0BEC5",
  },
  {
    id: "scale_balance",
    name: "저울",
    description: "A balance scale with two pans, representing fairness",
    colors: "gold #FFD54F, pans #B0BEC5, beam #78909C",
  },

  // === 시간/성장 (4) ===
  {
    id: "clock",
    name: "시계",
    description: "A simple round clock face with hour and minute hands",
    colors: "blue #42A5F5, face #E3F2FD, hands #1B2838",
  },
  {
    id: "hourglass",
    name: "모래시계",
    description: "An hourglass with sand flowing, representing time",
    colors: "gold #FFD54F, glass #B0BEC5, sand #FFB74D",
  },
  {
    id: "seedling",
    name: "새싹",
    description: "A small seedling growing from soil with two leaves",
    colors: "green #81C784, leaves #A5D6A7, soil #8D6E63",
  },
  {
    id: "tree",
    name: "나무",
    description: "A full-grown tree with a round canopy, representing maturity",
    colors: "green #66BB6A, trunk #8D6E63, leaves #A5D6A7",
  },

  // === 사람/행동 (4) ===
  {
    id: "handshake",
    name: "악수",
    description: "Two hands shaking, representing agreement or partnership",
    colors: "warm skin #FFCC80, cuff blue #42A5F5, cuff teal #26A69A",
  },
  {
    id: "target",
    name: "과녁",
    description:
      "A bullseye target with three concentric rings and an arrow in center",
    colors: "red #EF5350, white #FFFFFF, arrow #FFD54F",
  },
  {
    id: "shield_check",
    name: "보안 방패",
    description: "A shield with a checkmark inside, representing security",
    colors: "teal #26A69A, checkmark white #FFFFFF",
  },
  {
    id: "lightbulb",
    name: "전구",
    description: "A glowing lightbulb with rays, representing ideas",
    colors: "yellow #FFD54F, glass #FFF9C4, rays #FFB74D",
  },

  // === 방향/상태 (6) ===
  {
    id: "arrow_up",
    name: "상승 화살표",
    description: "A bold upward pointing arrow",
    colors: "green #81C784, accent #A5D6A7",
  },
  {
    id: "arrow_down",
    name: "하락 화살표",
    description: "A bold downward pointing arrow",
    colors: "red #EF5350, accent #EF9A9A",
  },
  {
    id: "check_circle",
    name: "체크 원",
    description:
      "A circle with a checkmark inside, representing success or approval",
    colors: "green #66BB6A, checkmark white #FFFFFF",
  },
  {
    id: "x_circle",
    name: "X 원",
    description:
      "A circle with an X inside, representing failure or rejection",
    colors: "red #EF5350, x-mark white #FFFFFF",
  },
  {
    id: "warning",
    name: "경고",
    description:
      "A triangle with an exclamation mark, representing caution",
    colors: "amber #FFA726, exclamation #1B2838",
  },
  {
    id: "star",
    name: "별",
    description: "A five-pointed star, representing excellence or rating",
    colors: "gold #FFD54F, accent #FFF176",
  },
];
