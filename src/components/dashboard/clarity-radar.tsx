"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarDimension {
  subject: string;
  score: number;
  fullMark: number;
}

interface ClarityRadarProps {
  data: RadarDimension[];
  color?: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: RadarDimension }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground">{d.subject}</p>
      <p className="text-muted-foreground mt-0.5">{d.score}%</p>
    </div>
  );
}

export function ClarityRadar({ data, color = "#1B6FF3" }: ClarityRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
        <PolarGrid
          stroke="hsl(var(--border))"
          strokeOpacity={0.5}
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
          tickLine={false}
        />
        <Radar
          name="Clarity"
          dataKey="score"
          stroke={color}
          fill={color}
          fillOpacity={0.18}
          strokeWidth={2}
          dot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
