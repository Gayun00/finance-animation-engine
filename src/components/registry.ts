import React from "react";
import { TitleCard } from "./TitleCard";
import { EndCard } from "./EndCard";
import { CountUpNumber } from "./CountUpNumber";
import { CompoundInterestChart } from "./CompoundInterestChart";
import { CalloutBox } from "./CalloutBox";
import { CenterLayout } from "./CenterLayout";
import { LottieElement } from "./LottieElement";
import { LottieOverlay } from "./LottieOverlay";

export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  TitleCard,
  EndCard,
  CountUpNumber,
  CompoundInterestChart,
  CalloutBox,
  CenterLayout,
  LottieElement,
  LottieOverlay,
};
