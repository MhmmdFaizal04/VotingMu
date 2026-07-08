"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { PollOption } from "@/lib/queries/polls";

interface ResultsChartProps {
  options: PollOption[];
  total: number;
  userVoteId?: string | null;
}

interface TooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  total: number;
}

function CustomTooltip({ active, payload, label, total }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const count = payload[0].value;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="bg-white border border-[#e9edef] rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-[#111b21]">{label}</p>
      <p className="text-[#128c7e]">{count} suara ({pct}%)</p>
    </div>
  );
}

export default function ResultsChart({ options, total, userVoteId }: ResultsChartProps) {
  const data = options.map((o) => ({
    name: o.text.length > 20 ? o.text.slice(0, 18) + "..." : o.text,
    fullName: o.text,
    votes: o.vote_count,
    id: o.id,
    pct: total > 0 ? Math.round((o.vote_count / total) * 100) : 0,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 52)}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 13, fill: "#111b21", fontFamily: "var(--font-bricolage, sans-serif)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip total={total} />} cursor={{ fill: "#f0f2f5" }} />
          <Bar dataKey="votes" radius={[0, 6, 6, 0]} isAnimationActive>
            {data.map((entry) => (
              <Cell
                key={entry.id}
                fill={entry.id === userVoteId ? "#128c7e" : "#25d366"}
              />
            ))}
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v: unknown) => `${v}%`}
              style={{ fontSize: 12, fill: "#667781", fontFamily: "var(--font-bricolage, sans-serif)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
