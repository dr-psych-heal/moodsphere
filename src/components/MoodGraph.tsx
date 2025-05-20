
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodEntry } from '../types';

interface MoodGraphProps {
  data: MoodEntry[];
}

const MoodGraph: React.FC<MoodGraphProps> = ({ data }) => {
  // Format data for the chart
  const chartData = data.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    score: entry.overallScore
  }));

  return (
    <div className="w-full h-64 bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">Your Mood History</h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} />
          <YAxis domain={[0, 10]} stroke="#888" fontSize={12} tickLine={false} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#9b87f5" 
            strokeWidth={2}
            dot={{ stroke: '#7E69AB', strokeWidth: 2, r: 4, fill: '#fff' }}
            activeDot={{ r: 6, stroke: '#9b87f5', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodGraph;
