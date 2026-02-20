import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { evolvePath } from "@remotion/paths";
import { COLORS } from "../theme/colors";
import { TYPOGRAPHY } from "../theme/typography";
import { EASINGS } from "../animations/easings";

interface CompoundInterestChartProps {
  principal: number; // 초기 투자금
  compoundRate: number; // 복리 이율 (0.07 = 7%)
  simpleRate: number; // 단리 이율
  years: number; // 기간
  drawDuration?: number; // frames for line drawing
}

export const CompoundInterestChart: React.FC<CompoundInterestChartProps> = ({
  principal = 1000,
  compoundRate = 0.07,
  simpleRate = 0.07,
  years = 30,
  drawDuration = 120,
}) => {
  const frame = useCurrentFrame();

  // Chart dimensions
  const chartLeft = 140;
  const chartTop = 80;
  const chartWidth = 1640;
  const chartHeight = 800;
  const chartBottom = chartTop + chartHeight;

  // Calculate data points
  const compoundValues: number[] = [];
  const simpleValues: number[] = [];
  for (let y = 0; y <= years; y++) {
    compoundValues.push(principal * Math.pow(1 + compoundRate, y));
    simpleValues.push(principal * (1 + simpleRate * y));
  }

  const maxValue = Math.max(...compoundValues);
  const minValue = 0;

  // Map data to chart coordinates
  const toX = (year: number) =>
    chartLeft + (year / years) * chartWidth;
  const toY = (value: number) =>
    chartBottom - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  // Build SVG paths
  const buildPath = (values: number[]) => {
    return values
      .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`)
      .join(" ");
  };

  const compoundPath = buildPath(compoundValues);
  const simplePath = buildPath(simpleValues);

  // Animate line drawing
  const drawProgress = interpolate(frame, [20, 20 + drawDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASINGS.kurzgesagt,
  });

  const compoundEvolved = evolvePath(drawProgress, compoundPath);
  const simpleEvolved = evolvePath(drawProgress, simplePath);

  // Axis labels fade-in
  const labelOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Legend fade-in
  const legendOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Y-axis tick values
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: minValue + pct * (maxValue - minValue),
    y: chartBottom - pct * chartHeight,
  }));

  // X-axis tick values
  const xStep = years <= 10 ? 1 : years <= 20 ? 5 : 10;
  const xTicks: number[] = [];
  for (let y = 0; y <= years; y += xStep) xTicks.push(y);

  return (
    <AbsoluteFill style={{ padding: 40 }}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={tick.value}
            x1={chartLeft}
            y1={tick.y}
            x2={chartLeft + chartWidth}
            y2={tick.y}
            stroke={COLORS.chart.grid}
            strokeWidth={1}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={`y-${tick.value}`}
            x={chartLeft - 16}
            y={tick.y + 5}
            textAnchor="end"
            fill={COLORS.text.muted}
            fontFamily={TYPOGRAPHY.fontFamily.body}
            fontSize={16}
            opacity={labelOpacity}
          >
            {new Intl.NumberFormat("ko-KR").format(Math.round(tick.value))}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((year) => (
          <text
            key={`x-${year}`}
            x={toX(year)}
            y={chartBottom + 30}
            textAnchor="middle"
            fill={COLORS.text.muted}
            fontFamily={TYPOGRAPHY.fontFamily.body}
            fontSize={16}
            opacity={labelOpacity}
          >
            {year}년
          </text>
        ))}

        {/* Simple interest line */}
        <path
          d={simplePath}
          fill="none"
          stroke={COLORS.chart.simple}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={simpleEvolved.strokeDasharray}
          strokeDashoffset={simpleEvolved.strokeDashoffset}
        />

        {/* Compound interest line */}
        <path
          d={compoundPath}
          fill="none"
          stroke={COLORS.chart.compound}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={compoundEvolved.strokeDasharray}
          strokeDashoffset={compoundEvolved.strokeDashoffset}
        />

        {/* Legend */}
        <g opacity={legendOpacity} transform="translate(1500, 120)">
          <rect
            x={0}
            y={0}
            width={20}
            height={4}
            fill={COLORS.chart.compound}
            rx={2}
          />
          <text
            x={30}
            y={6}
            fill={COLORS.text.primary}
            fontFamily={TYPOGRAPHY.fontFamily.body}
            fontSize={20}
          >
            복리
          </text>
          <rect
            x={0}
            y={30}
            width={20}
            height={4}
            fill={COLORS.chart.simple}
            rx={2}
          />
          <text
            x={30}
            y={36}
            fill={COLORS.text.primary}
            fontFamily={TYPOGRAPHY.fontFamily.body}
            fontSize={20}
          >
            단리
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
