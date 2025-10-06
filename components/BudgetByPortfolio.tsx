'use client';

import { ProjectData } from '@/types/project';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo, useState, useEffect } from 'react';

interface BudgetByPortfolioProps {
  data: ProjectData[];
}

export default function BudgetByPortfolio({ data }: BudgetByPortfolioProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset states when data changes
  useEffect(() => {
    setError(null);
    setRetryCount(0);
  }, [data]);

  const chartData = useMemo(() => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate input data
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
      }

      if (data.length === 0) {
        setIsProcessing(false);
        return [];
      }

      const portfolioMap = new Map<string, number>();

      data.forEach(project => {
        try {
          if (!project || typeof project !== 'object') {
            console.warn('Invalid project data:', project);
            return;
          }

          const portfolio = (project.Portfolio || 'Unknown').toString();
          const budget = Number(project['Digital budget (millions)']) || 0;

          if (budget > 0) {
            portfolioMap.set(portfolio, (portfolioMap.get(portfolio) || 0) + budget);
          }
        } catch (err) {
          console.warn('Error processing project budget:', err, project);
        }
      });

      const result = Array.from(portfolioMap.entries())
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Show top 10 portfolios

      setIsProcessing(false);
      return result;
    } catch (err) {
      console.error('Error processing budget chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to process budget chart data');
      setIsProcessing(false);
      return [];
    }
  }, [data, retryCount]);

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

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Loading state
  if (isProcessing) {
    return (
      <div className="bg-white p-3 rounded-lg shadow">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Budget Allocation by Portfolio
        </h3>
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-3 rounded-lg shadow">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Budget Allocation by Portfolio
        </h3>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl mb-2">⚠️</div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Chart Error</h4>
            <p className="text-xs text-gray-600 mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty data state
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-3 rounded-lg shadow">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Budget Allocation by Portfolio
        </h3>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl mb-2">📊</div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">No Budget Data</h4>
            <p className="text-xs text-gray-600">No budget information available for chart generation</p>
          </div>
        </div>
      </div>
    );
  }

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