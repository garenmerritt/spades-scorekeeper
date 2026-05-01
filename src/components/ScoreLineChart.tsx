'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export interface ScorePoint {
  label: string;
  team1Score: number;
  team2Score: number;
  team1Name: string;
  team2Name: string;
}

interface Props {
  data: ScorePoint[];
}

export default function ScoreLineChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-700 text-sm">
        Play at least 2 games to see a trend
      </div>
    );
  }

  // Use the team names from the most recent game for the legend
  const latest = data[data.length - 1];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#71717a', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <ReferenceLine y={0} stroke="#3f3f46" />
        <Tooltip
          cursor={{ stroke: '#3f3f46' }}
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
        <Line
          type="monotone"
          dataKey="team1Score"
          name={latest.team1Name || 'Team 1'}
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="team2Score"
          name={latest.team2Name || 'Team 2'}
          stroke="#f43f5e"
          strokeWidth={2}
          dot={{ fill: '#f43f5e', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
