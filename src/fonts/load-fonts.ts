import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadBlackHanSans } from "@remotion/google-fonts/BlackHanSans";
import { loadFont as loadNotoSansKR } from "@remotion/google-fonts/NotoSansKR";

export function loadFonts() {
  const inter = loadInter("normal", {
    weights: ["400", "500", "600", "700"],
    subsets: ["latin"],
  });
  const blackHanSans = loadBlackHanSans("normal", {
    weights: ["400"],
  });
  const notoSansKR = loadNotoSansKR("normal", {
    weights: ["400", "700"],
  });

  return { inter, blackHanSans, notoSansKR };
}
