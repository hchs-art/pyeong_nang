"use client";

import { useId } from "react";

/** 룰렛 휠을 그리는 순수 표시 컴포넌트. 회전은 부모가 제어한다. */
export interface RouletteWheelProps {
  items: string[];
  /** 현재 회전 각도(도). 누적 값이며 CSS transition으로 애니메이션된다. */
  rotation: number;
  /** 회전 애니메이션 활성화 여부. */
  spinning: boolean;
  /** 회전이 끝났을 때(transition 종료) 호출. */
  onSpinEnd?: () => void;
}

// 세그먼트에 순환 적용할 색상 팔레트.
const COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#22c55e", // green-500
  "#14b8a6", // teal-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
];

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = CENTER - 4;

// 좌표를 고정 소수점으로 반올림해 SSR/클라이언트 직렬화가 일치하도록 한다(하이드레이션 안정성).
const round = (n: number) => Math.round(n * 1000) / 1000;

/** 극좌표(중심 기준)를 SVG 좌표로 변환. 0도는 12시 방향, 시계방향 증가. */
function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: round(CENTER + radius * Math.cos(rad)),
    y: round(CENTER + radius * Math.sin(rad)),
  };
}

function segmentPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(endAngle, RADIUS);
  const end = polarToCartesian(startAngle, RADIUS);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export default function RouletteWheel({
  items,
  rotation,
  spinning,
  onSpinEnd,
}: RouletteWheelProps) {
  const gradientId = useId();
  const count = Math.max(items.length, 1);
  const segAngle = 360 / count;

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      {/* 상단 고정 포인터 */}
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
        <div
          className="h-0 w-0 drop-shadow-md"
          style={{
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: "24px solid #1f2937",
          }}
          aria-hidden
        />
      </div>

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="rounded-full shadow-xl"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
            : "none",
        }}
        onTransitionEnd={() => {
          if (spinning) onSpinEnd?.();
        }}
        role="img"
        aria-label={`룰렛 휠, 항목 ${count}개`}
      >
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="85%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </radialGradient>
        </defs>

        {items.length === 0 ? (
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#e5e7eb" />
        ) : (
          items.map((label, i) => {
            const start = i * segAngle;
            const end = start + segAngle;
            const mid = start + segAngle / 2;
            const textPos = polarToCartesian(mid, RADIUS * 0.62);
            return (
              <g key={i}>
                <path
                  d={segmentPath(start, end)}
                  fill={COLORS[i % COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                <text
                  x={textPos.x}
                  y={textPos.y}
                  fill="#ffffff"
                  fontSize={items.length > 12 ? 11 : 14}
                  fontWeight={600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${round(mid)}, ${textPos.x}, ${textPos.y})`}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {label.length > 8 ? `${label.slice(0, 8)}…` : label}
                </text>
              </g>
            );
          })
        )}

        {/* 입체감용 음영 + 중심 허브 */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={`url(#${gradientId})`} />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={20}
          fill="#1f2937"
          stroke="#ffffff"
          strokeWidth={4}
        />
      </svg>
    </div>
  );
}
