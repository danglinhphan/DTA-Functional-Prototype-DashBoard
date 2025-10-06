'use client';

import { ProjectData } from '@/types/project';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { useMemo } from 'react';

interface DCAByTierChartProps {
  data: ProjectData[];
}

export default function DCAByTierChart({ data }: DCAByTierChartProps) {
  const chartData = useMemo(() => {
    const tiers = ['Tier 1', 'Tier 2', 'Tier 3'];
    const dcaLevels = ['High', 'Medium-High', 'Medium', 'Medium-Low', 'Low'];
    
    return tiers.map(tier => {
      const tierProjects = data.filter(d => d.Tier === tier);
      const dcaCounts: any = { name: tier };
      
      dcaLevels.forEach(level => {
        dcaCounts[level] = tierProjects.filter(p => p['DCA 2025'] === level).length;
      });
      
      return dcaCounts;
    });
  }, [data]);

  const colors = {
    'High': '#10b981',
    'Medium-High': '#84cc16',
    'Medium': '#f59e0b',
    'Medium-Low': '#f97316',
    'Low': '#ef4444'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        DCA Confidence Level Distribution by Tier
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value: number, name: string) => [value, `DCA ${name}`]}
            labelFormatter={(label) => `Tier: ${label}`}
          />
          <Legend />
          {Object.entries(colors).map(([level, color]) => (
            <Bar 
              key={level}
              dataKey={level} 
              stackId="a" 
              fill={color}
              name={level}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}