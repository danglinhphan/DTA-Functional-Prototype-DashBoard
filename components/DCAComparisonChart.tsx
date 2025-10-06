'use client';

import { ProjectData } from '@/types/project';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';

interface DCAComparisonChartProps {
  data: ProjectData[];
}

export default function DCAComparisonChart({ data }: DCAComparisonChartProps) {
  const chartData = useMemo(() => {
    return data
      .filter(d => d['DCA 2024'] && d['DCA 2025']) // Only projects with both DCA values
      .slice(0, 20) // Show first 20 projects for readability
      .map(project => ({
        name: project['Project name'].length > 30 
          ? `${project['Project name'].substring(0, 30)}...` 
          : project['Project name'],
        'DCA 2024': getDCAScore(project['DCA 2024']),
        'DCA 2025': getDCAScore(project['DCA 2025']),
        fullName: project['Project name'],
        agency: project.Agency,
      }));
  }, [data]);

  function getDCAScore(dca: string): number {
    const scores: Record<string, number> = {
      'High': 5,
      'Medium-High': 4,
      'Medium': 3,
      'Medium-Low': 2,
      'Low': 1,
    };
    return scores[dca] || 0;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow max-w-xs">
          <p className="font-medium text-sm">{data.fullName}</p>
          <p className="text-xs text-gray-600 mb-2">{data.agency}</p>
          <p className="text-sm">DCA 2024: {getDCALabel(payload[0].value)}</p>
          <p className="text-sm">DCA 2025: {getDCALabel(payload[1].value)}</p>
        </div>
      );
    }
    return null;
  };

  function getDCALabel(score: number): string {
    const labels: Record<number, string> = {
      5: 'High',
      4: 'Medium-High',
      3: 'Medium',
      2: 'Medium-Low',
      1: 'Low',
    };
    return labels[score] || 'Unknown';
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow">
      <h3 className="text-md font-semibold text-gray-800 mb-2">
        DCA Changes (2024 vs 2025)
      </h3>
      <ResponsiveContainer width="100%" height={600}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 20, left: 20, bottom: 140 }}
          barCategoryGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={120}
            fontSize={10}
            interval={0}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            domain={[0, 5]}
            tickFormatter={(value) => getDCALabel(value)}
            fontSize={11}
            width={80}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '25px',
              fontSize: '13px'
            }}
          />
          <Bar dataKey="DCA 2024" fill="#94a3b8" name="DCA 2024" maxBarSize={35} />
          <Bar dataKey="DCA 2025" fill="#1e40af" name="DCA 2025" maxBarSize={35} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}