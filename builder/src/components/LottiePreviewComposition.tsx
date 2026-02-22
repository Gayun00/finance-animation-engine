import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";

interface Props {
  lottieUrl: string;
  bgColor: string;
}

export const LottiePreviewComposition: React.FC<Props> = ({ lottieUrl, bgColor }) => {
  const [handle] = useState(() => delayRender("Loading Lottie"));
  const [data, setData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch(lottieUrl)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [lottieUrl, handle]);

  if (!data) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bgColor,
      }}
    >
      <Lottie
        animationData={data}
        loop
        style={{ width: "80%", height: "80%" }}
      />
    </div>
  );
};
