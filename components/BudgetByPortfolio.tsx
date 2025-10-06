'use client';

import { ProjectData } from '@/types/project';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';

interface BudgetByPortfolioProps {
  data: ProjectData[];
}

export default function BudgetByPortfolio({ data }: BudgetByPortfolioProps) {
  const chartData = useMemo(() => {
    const portfolioMap = new Map<string, number>();
    
    data.forEach(project => {
      const portfolio = project.Portfolio || 'Unknown';
      const budget = project['Digital budget (millions)'] || 0;
      portfolioMap.set(portfolio, (portfolioMap.get(portfolio) || 0) + budget);
    });

    return Array.from(portfolioMap.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Show top 10 portfolios
  }, [data]);

  const colors = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#fbbf24', '#f59e0b', '#d97706', '#dc2626', '#991b1b'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Budget: ${data.value.toFixed(1)}M
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow">
      <h3 className="text-md font-semibold text-gray-800 mb-2">
        Budget Allocation by Portfolio
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 15, left: 10, bottom: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={8}
            interval={0}
          />
          <YAxis 
            tickFormatter={(value) => `$${value}M`}
            fontSize={9}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" name="Digital Budget (Millions)" maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}