'use client';

import { ProjectData } from '@/types/project';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo, useState, useEffect } from 'react';

interface DCAComparisonChartProps {
  data: ProjectData[];
}

export default function DCAComparisonChart({ data }: DCAComparisonChartProps) {
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

      const result = data
        .filter(d => {
          try {
            return d && typeof d === 'object' &&
              d['DCA 2025'] && d['DCA 2026'] &&
              d['Project name'];
          } catch (err) {
            console.warn('Error filtering project:', err, d);
            return false;
          }
        }) // Only projects with both DCA values
        .slice(0, 20) // Show first 20 projects for readability
        .map(project => {
          try {
            const projectName = (project['Project name'] || '').toString();
            const displayName = projectName.length > 30
              ? `${projectName.substring(0, 30)}...`
              : projectName;

            return {
              name: displayName,
              'DCA 2025': getDCAScore(project['DCA 2025']),
              'DCA 2026': getDCAScore(project['DCA 2026']),
              fullName: projectName,
              agency: (project.Agency || '').toString(),
            };
          } catch (err) {
            console.warn('Error processing project for chart:', err, project);
            return null;
          }
        })
        .filter(Boolean); // Remove null entries

      setIsProcessing(false);
      return result;
    } catch (err) {
      console.error('Error processing DCA comparison chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to process DCA comparison chart data');
      setIsProcessing(false);
      return [];
    }
  }, [data, retryCount]);

  function getDCAScore(dca: string): number {
    try {
      const scores: Record<string, number> = {
        'High': 5,
        'Medium-High': 4,
        'Medium': 3,
        'Medium-Low': 2,
        'Low': 1,
      };
      return scores[dca] || 0;
    } catch (err) {
      console.warn('Error getting DCA score:', err, dca);
      return 0;
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow max-w-xs">
          <p className="font-medium text-sm">{data.fullName}</p>
          <p className="text-xs text-gray-600 mb-2">{data.agency}</p>
          <p className="text-sm">DCA 2025: {getDCALabel(payload[0].value)}</p>
          <p className="text-sm">DCA 2026: {getDCALabel(payload[1].value)}</p>
        </div>
      );
    }
    return null;
  };

  function getDCALabel(score: number): string {
    try {
      const labels: Record<number, string> = {
        5: 'High',
        4: 'Medium-High',
        3: 'Medium',
        2: 'Medium-Low',
        1: 'Low',
      };
      return labels[score] || 'Unknown';
    } catch (err) {
      console.warn('Error getting DCA label:', err, score);
      return 'Unknown';
    }
  }

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Loading state
  if (isProcessing) {
    return (
      <div className="bg-white p-3 rounded-lg shadow">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          DCA Changes (2025 vs 2026)
        </h3>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-3 rounded-lg shadow">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          DCA Changes (2025 vs 2026)
        </h3>
        <div className="h-96 flex items-center justify-center">
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
          DCA Changes (2025 vs 2026)
        </h3>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl mb-2">📊</div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">No Comparison Data</h4>
            <p className="text-xs text-gray-600">No projects with both DCA 2025 and 2026 data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow">
      <h3 className="text-md font-semibold text-gray-800 mb-2">
        DCA Changes (2025 vs 2026)
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
          <Bar dataKey="DCA 2025" fill="#94a3b8" name="DCA 2025" maxBarSize={35} />
          <Bar dataKey="DCA 2026" fill="#1e40af" name="DCA 2026" maxBarSize={35} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}