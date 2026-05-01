'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface TeamStat {
  name: string;
  wins: number;
  losses: number;
  ties: number;
}

interface Props {
  data: TeamStat[];
}

export default function WinsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-700 text-sm">
        No data yet — complete a game to see stats
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#71717a', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#71717a', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          contentStyle={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 8,
            fontSize: 13,
          }}
          labelStyle={{ color: '#f4f4f5', fontWeight: 500, marginBottom: 4 }}
          itemStyle={{ color: '#a1a1aa' }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#71717a', paddingTop: 12 }}
        />
        <Bar dataKey="wins" name="Wins" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="losses" name="Losses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="ties" name="Ties" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
