
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodEntry } from '../types';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";

interface MoodGraphProps {
  data: MoodEntry[];
  height?: number | string;
  compact?: boolean;
  hideHeader?: boolean;
}

const MoodGraph: React.FC<MoodGraphProps> = ({
  data,
  height = "80%",
  compact = false,
  hideHeader = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Format data for the chart
  const chartData = data.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    score: entry.overallScore
  }));

  if (compact) {
    return (
      <div className="w-full h-16 opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Line
              type="monotone"
              dataKey="score"
              stroke="#D4738A"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full h-64 bg-card p-4 rounded-lg border border-border",
      hideHeader && "p-0 bg-transparent border-none"
    )}>
      {!hideHeader && <h3 className="text-sm font-semibold mb-3 text-foreground">Your Mood History</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#f0f0f0"} />
          <XAxis
            dataKey="date"
            stroke={isDark ? "#aaa" : "#888"}
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            stroke={isDark ? "#aaa" : "#888"}
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#333" : "#fff",
              color: isDark ? "#fff" : "#333",
              borderColor: isDark ? "#555" : "#ddd"
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#D4738A"
            strokeWidth={2}
            dot={{ stroke: '#D4738A', strokeWidth: 2, r: 4, fill: isDark ? '#1A1A1E' : '#fff' }}
            activeDot={{ r: 6, stroke: '#D4738A', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodGraph;
