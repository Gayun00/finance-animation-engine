/**
 * 실험 B: Reference 수렴 테스트용 새 아이콘 5종
 * 실험 A와 겹치지 않는 금융 개념 아이콘
 */

import { IconPrompt } from "./prompts";

export const ROUND_B_ICONS: IconPrompt[] = [
  {
    id: "icon_bank_building",
    name: "은행 건물",
    description:
      "A classical bank building with columns and a triangular pediment",
    colors: "white #E0E0E0, columns #B0BEC5, accent gold #FFD54F",
  },
  {
    id: "icon_shield_check",
    name: "보안 방패",
    description:
      "A shield with a checkmark inside, representing security and protection",
    colors: "teal #26A69A, checkmark white #FFFFFF, accent #4DB6AC",
  },
  {
    id: "icon_clock_money",
    name: "시간가치 시계",
    description:
      "A clock face with a dollar sign on one hand, representing time value of money",
    colors: "blue #42A5F5, clock face #E3F2FD, dollar #FFD54F",
  },
  {
    id: "icon_graph_bar",
    name: "상승 막대 차트",
    description:
      "Three ascending bar chart columns with an upward trend arrow",
    colors: "purple #AB47BC, bars gradient #CE93D8 to #7B1FA2, arrow #FFD54F",
  },
  {
    id: "icon_wallet",
    name: "지갑",
    description:
      "An open wallet with cards and bills peeking out",
    colors: "brown #8D6E63, card #42A5F5, bills #81C784",
  },
];
