'use client';

import { ProjectData, KPIData } from '@/types/project';
import { useMemo, useState, useEffect } from 'react';

interface KPIPanelProps {
  data: ProjectData[];
}

export default function KPIPanel({ data }: KPIPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset states when data changes
  useEffect(() => {
    setError(null);
    setRetryCount(0);
  }, [data]);

  const kpiData = useMemo((): KPIData | null => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate input data
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
      }

      if (data.length === 0) {
        // This is not an error, just no data
        setIsProcessing(false);
        return null;
      }

      // Validate data structure
      const validProjects = data.filter(project => {
        if (!project || typeof project !== 'object') {
          console.warn('Invalid project object:', project);
          return false;
        }

        // Check required fields
        const requiredFields = ['Portfolio', 'Agency', 'Tier', 'Delivery status', 'DCA 2025'];
        const missingFields = requiredFields.filter(field => !project[field as keyof ProjectData]);

        if (missingFields.length > 0) {
          console.warn(`Project missing required fields: ${missingFields.join(', ')}`, project);
          return false;
        }

        return true;
      });

      if (validProjects.length === 0) {
        throw new Error('No valid project data found');
      }

      // Calculate KPIs with error handling
      const activeProjects = validProjects.filter(d => {
        try {
          return d['Delivery status'] === 'Active';
        } catch (err) {
          console.warn('Error checking delivery status:', err, d);
          return false;
        }
      });

      const totalDigitalBudget = validProjects.reduce((sum, d) => {
        try {
          const budget = d['Digital budget (millions)'];
          const numBudget = typeof budget === 'number' ? budget :
                           typeof budget === 'string' ? parseFloat(budget) || 0 : 0;
          return sum + numBudget;
        } catch (err) {
          console.warn('Error calculating budget:', err, d);
          return sum;
        }
      }, 0);

      const highRiskProjects = validProjects.filter(d => {
        try {
          const dcaValue = d['DCA 2025'];
          return dcaValue === 'Low' || dcaValue === 'Medium-Low';
        } catch (err) {
          console.warn('Error checking DCA value:', err, d);
          return false;
        }
      }).length;

      const tier12Projects = validProjects.filter(d => {
        try {
          return d.Tier === 'Tier 1' || d.Tier === 'Tier 2';
        } catch (err) {
          console.warn('Error checking tier:', err, d);
          return false;
        }
      });

      const healthyTier12Projects = tier12Projects.filter(d => {
        try {
          const dcaValue = d['DCA 2025'];
          return dcaValue === 'High' || dcaValue === 'Medium-High';
        } catch (err) {
          console.warn('Error checking healthy DCA:', err, d);
          return false;
        }
      }).length;

      const healthyTier12Percentage = tier12Projects.length > 0
        ? (healthyTier12Projects / tier12Projects.length) * 100
        : 0;

      setIsProcessing(false);
      return {
        totalActiveProjects: activeProjects.length,
        totalDigitalBudget: totalDigitalBudget,
        highRiskProjects: highRiskProjects,
        healthyTier12Percentage: healthyTier12Percentage,
      };
    } catch (err) {
      console.error('Error calculating KPI data:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate KPI data');
      setIsProcessing(false);
      return null;
    }
  }, [data, retryCount]);

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Loading state
  if (isProcessing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-3 rounded-lg shadow border-l-4 border-gray-300 animate-pulse">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error || !kpiData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="md:col-span-2 lg:col-span-4 bg-white p-4 rounded-lg shadow border border-red-200">
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">KPI Calculation Error</h4>
            <p className="text-xs text-gray-600 mb-3">{error || 'No data available'}</p>
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Active Projects */}
      <div className="bg-white p-3 rounded-lg shadow border-l-4 border-blue-500">
        <h3 className="text-xs font-medium text-gray-500 mb-1">Active Projects</h3>
        <p className="text-xl font-bold text-blue-600">{kpiData.totalActiveProjects}</p>
      </div>

      {/* Total Digital Budget */}
      <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500">
        <h3 className="text-xs font-medium text-gray-500 mb-1">Digital Budget</h3>
        <p className="text-xl font-bold text-green-600">
          ${(kpiData.totalDigitalBudget / 1000).toFixed(1)}B
        </p>
      </div>

      {/* High Risk Projects */}
      <div className="bg-white p-3 rounded-lg shadow border-l-4 border-red-500">
        <h3 className="text-xs font-medium text-gray-500 mb-1">High Risk Projects</h3>
        <p className="text-xl font-bold text-red-600">{kpiData.highRiskProjects}</p>
      </div>

      {/* Healthy Tier 1&2 Percentage */}
      <div className="bg-white p-3 rounded-lg shadow border-l-4 border-emerald-500">
        <h3 className="text-xs font-medium text-gray-500 mb-1">Tier 1&2 "Healthy"</h3>
        <p className="text-xl font-bold text-emerald-600">
          {kpiData.healthyTier12Percentage.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}