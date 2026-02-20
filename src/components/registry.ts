import React from "react";
import { TitleCard } from "./TitleCard";
import { EndCard } from "./EndCard";
import { CountUpNumber } from "./CountUpNumber";
import { CompoundInterestChart } from "./CompoundInterestChart";
import { CalloutBox } from "./CalloutBox";
import { CenterLayout } from "./CenterLayout";
import { SplitLayout } from "./SplitLayout";
import { TopBottomLayout } from "./TopBottomLayout";
import { GridLayout } from "./GridLayout";
import { FocusLayout } from "./FocusLayout";
import { Spotlight } from "./Spotlight";
import { LottieElement } from "./LottieElement";
import { LottieOverlay } from "./LottieOverlay";
import { Subtitle } from "./Subtitle";
import { LottieShowcase } from "./LottieShowcase";
import { FloatingParticles } from "./FloatingParticles";
import { GeometricDecor } from "./GeometricDecor";
import { GradientOrb } from "./GradientOrb";
import { SceneLabel } from "./SceneLabel";
import { StaticImage } from "./StaticImage";

export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  TitleCard,
  EndCard,
  CountUpNumber,
  CompoundInterestChart,
  CalloutBox,
  CenterLayout,
  SplitLayout,
  TopBottomLayout,
  GridLayout,
  FocusLayout,
  Spotlight,
  LottieElement,
  LottieOverlay,
  Subtitle,
  LottieShowcase,
  FloatingParticles,
  GeometricDecor,
  GradientOrb,
  SceneLabel,
  StaticImage,
};
