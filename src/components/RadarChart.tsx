import React from 'react';

interface RadarChartProps {
  data: { axis: string; value: number }[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 260 }) => {
  const center = size / 2;
  const radius = size * 0.38;
  const total = data.length;

  // Generate polygon points
  const points = data.map((d, i) => {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const r = (d.value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Grid concentric levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background grid concentric polygons */}
        {levels.map((lvl, idx) => {
          const gridPoints = data.map((_, i) => {
            const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
            const r = lvl * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={idx}
              points={gridPoints}
              fill="none"
              stroke="rgba(120, 113, 108, 0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Radial axes from center */}
        {data.map((_, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(120, 113, 108, 0.22)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled data polygon */}
        <polygon
          points={points}
          fill="rgba(41, 37, 36, 0.12)"
          stroke="#1C1917"
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Data vertex points */}
        {data.map((d, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const r = (d.value / 100) * radius;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);

          // Label position slightly outside radius
          const labelR = radius + 20;
          const labelX = center + labelR * Math.cos(angle);
          const labelY = center + labelR * Math.sin(angle);

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="3.5"
                fill="#1C1917"
                stroke="#FAF8F5"
                strokeWidth="1.5"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-mono fill-stone-700 uppercase tracking-wider font-semibold"
              >
                {d.axis}
              </text>
              <text
                x={labelX}
                y={labelY + 11}
                textAnchor="middle"
                className="text-[9px] font-mono fill-stone-900 font-bold tabular-nums"
              >
                {d.value}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
