'use client';

import { ProjectData, KPIData } from '@/types/project';
import { useMemo } from 'react';

interface KPIPanelProps {
  data: ProjectData[];
}

export default function KPIPanel({ data }: KPIPanelProps) {
  const kpiData = useMemo((): KPIData => {
    const activeProjects = data.filter(d => d['Delivery status'] === 'Active');
    const totalDigitalBudget = data.reduce((sum, d) => sum + (d['Digital budget (millions)'] || 0), 0);
    
    const highRiskProjects = data.filter(d => 
      d['DCA 2025'] === 'Low' || d['DCA 2025'] === 'Medium-Low'
    ).length;
    
    const tier12Projects = data.filter(d => 
      d.Tier === 'Tier 1' || d.Tier === 'Tier 2'
    );
    
    const healthyTier12Projects = tier12Projects.filter(d => 
      d['DCA 2025'] === 'High' || d['DCA 2025'] === 'Medium-High'
    ).length;
    
    const healthyTier12Percentage = tier12Projects.length > 0 
      ? (healthyTier12Projects / tier12Projects.length) * 100 
      : 0;

    return {
      totalActiveProjects: activeProjects.length,
      totalDigitalBudget: totalDigitalBudget,
      highRiskProjects: highRiskProjects,
      healthyTier12Percentage: healthyTier12Percentage,
    };
  }, [data]);

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