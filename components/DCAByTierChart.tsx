'use client';

import { ProjectData } from '@/types/project';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { useMemo, useState, useEffect } from 'react';

interface DCAByTierChartProps {
  data: ProjectData[];
}

export default function DCAByTierChart({ data }: DCAByTierChartProps) {
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

      const tiers = ['Tier 1', 'Tier 2', 'Tier 3'];
      const dcaLevels = ['High', 'Medium-High', 'Medium', 'Medium-Low', 'Low'];

      const result = tiers.map(tier => {
        try {
          const tierProjects = data.filter(d => {
            try {
              return d && typeof d === 'object' && d.Tier === tier;
            } catch (err) {
              console.warn('Error filtering project by tier:', err, d);
              return false;
            }
          });

          const dcaCounts: any = { name: tier };

          dcaLevels.forEach(level => {
            try {
              dcaCounts[level] = tierProjects.filter(p => {
                try {
                  return p && typeof p === 'object' && p['DCA 2026'] === level;
                } catch (err) {
                  console.warn('Error filtering project by DCA level:', err, p);
                  return false;
                }
              }).length;
            } catch (err) {
              console.warn('Error counting DCA level:', err, level);
              dcaCounts[level] = 0;
            }
          });

          return dcaCounts;
        } catch (err) {
          console.warn('Error processing tier:', err, tier);
          return { name: tier, High: 0, 'Medium-High': 0, Medium: 0, 'Medium-Low': 0, Low: 0 };
        }
      });

      setIsProcessing(false);
      return result;
    } catch (err) {
      console.error('Error processing chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to process chart data');
      setIsProcessing(false);
      return [];
    }
  }, [data, retryCount]);

  const colors = {
    'High': '#10b981',
    'Medium-High': '#84cc16',
    'Medium': '#f59e0b',
    'Medium-Low': '#f97316',
    'Low': '#ef4444'
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Loading state
  if (isProcessing) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          DCA Confidence Level Distribution by Tier
        </h3>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          DCA Confidence Level Distribution by Tier
        </h3>
        <div className="h-64 flex items-center justify-center">
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
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          DCA Confidence Level Distribution by Tier
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl mb-2">📊</div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">No Data Available</h4>
            <p className="text-xs text-gray-600">No projects found for chart generation</p>
          </div>
        </div>
      </div>
    );
  }

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