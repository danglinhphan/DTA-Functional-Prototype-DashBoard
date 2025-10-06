'use client';

import { ProjectData, FilterState } from '@/types/project';
import { useMemo } from 'react';

interface FilterPanelProps {
  data: ProjectData[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterPanel({ data, filters, onFiltersChange }: FilterPanelProps) {
  const { portfolios, agencies, tiers, deliveryStatuses, dca2025Values } = useMemo(() => {
    const portfolios = Array.from(new Set(data.map(d => d.Portfolio).filter(Boolean)));
    const agencies = Array.from(new Set(data.map(d => d.Agency).filter(Boolean)));
    const tiers = Array.from(new Set(data.map(d => d.Tier).filter(Boolean)));
    const deliveryStatuses = Array.from(new Set(data.map(d => d['Delivery status']).filter(Boolean)));
    const dca2025Values = Array.from(new Set(data.map(d => d['DCA 2025'] || 'Not reported').filter(Boolean)));

    return { portfolios, agencies, tiers, deliveryStatuses, dca2025Values };
  }, [data]);

  return (
    <div className="bg-white">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b">
        Filters
      </h3>
      
      <div className="space-y-2">
        {/* Portfolio Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Portfolio
          </label>
          <select
            value={filters.portfolio[0] || ''}
            onChange={(e) => onFiltersChange({
              ...filters, 
              portfolio: e.target.value ? [e.target.value] : []
            })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {portfolios.map(portfolio => (
              <option key={portfolio} value={portfolio}>{portfolio}</option>
            ))}
          </select>
        </div>

        {/* Agency Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Agency
          </label>
          <select
            value={filters.agency[0] || ''}
            onChange={(e) => onFiltersChange({
              ...filters, 
              agency: e.target.value ? [e.target.value] : []
            })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {agencies.slice(0, 10).map(agency => (
              <option key={agency} value={agency}>{agency.substring(0, 30)}...</option>
            ))}
          </select>
        </div>

        {/* Tier Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tier
          </label>
          <select
            value={filters.tier[0] || ''}
            onChange={(e) => onFiltersChange({
              ...filters, 
              tier: e.target.value ? [e.target.value] : []
            })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {tiers.map(tier => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
        </div>

        {/* DCA 2025 Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            DCA 2025
          </label>
          <select
            value={filters.dca2025[0] || ''}
            onChange={(e) => onFiltersChange({
              ...filters, 
              dca2025: e.target.value ? [e.target.value] : []
            })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {dca2025Values.map(dca => (
              <option key={dca} value={dca}>{dca}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onFiltersChange({
            portfolio: [],
            agency: [],
            tier: [],
            deliveryStatus: [],
            dca2025: []
          })}
          className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-1 px-2 rounded text-xs hover:bg-blue-100 transition-colors font-medium"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}