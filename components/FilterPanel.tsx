'use client';

import { ProjectData, FilterState } from '@/types/project';
import { useMemo, useState, useEffect } from 'react';

interface FilterPanelProps {
  data: ProjectData[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterPanel({ data, filters, onFiltersChange }: FilterPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset states when data changes
  useEffect(() => {
    setError(null);
    setRetryCount(0);
  }, [data]);

  const { portfolios, agencies, tiers, deliveryStatuses, dca2026Values } = useMemo(() => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate input data
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
      }

      if (data.length === 0) {
        setIsProcessing(false);
        return {
          portfolios: [],
          agencies: [],
          tiers: [],
          deliveryStatuses: [],
          dca2026Values: []
        };
      }

      // Extract and validate unique values with error handling
      const portfolios = Array.from(new Set(
        data
          .map(d => {
            try {
              return d.Portfolio;
            } catch (err) {
              console.warn('Error extracting portfolio:', err, d);
              return null;
            }
          })
          .filter(Boolean)
      )).sort();

      const agencies = Array.from(new Set(
        data
          .map(d => {
            try {
              return d.Agency;
            } catch (err) {
              console.warn('Error extracting agency:', err, d);
              return null;
            }
          })
          .filter(Boolean)
      )).sort();

      const tiers = Array.from(new Set(
        data
          .map(d => {
            try {
              return d.Tier;
            } catch (err) {
              console.warn('Error extracting tier:', err, d);
              return null;
            }
          })
          .filter(Boolean)
      )).sort();

      const deliveryStatuses = Array.from(new Set(
        data
          .map(d => {
            try {
              return d['Delivery status'];
            } catch (err) {
              console.warn('Error extracting delivery status:', err, d);
              return null;
            }
          })
          .filter(Boolean)
      )).sort();

      const dca2026Values = Array.from(new Set(
        data
          .map(d => {
            try {
              return d['DCA 2026'] || 'Not reported';
            } catch (err) {
              console.warn('Error extracting DCA 2026:', err, d);
              return 'Not reported';
            }
          })
          .filter(Boolean)
      )).sort();

      setIsProcessing(false);
      return { portfolios, agencies, tiers, deliveryStatuses, dca2026Values };
    } catch (err) {
      console.error('Error processing filter data:', err);
      setError(err instanceof Error ? err.message : 'Failed to process filter data');
      setIsProcessing(false);
      return {
        portfolios: [],
        agencies: [],
        tiers: [],
        deliveryStatuses: [],
        dca2026Values: []
      };
    }
  }, [data, retryCount]);

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Loading state
  if (isProcessing) {
    return (
      <div className="bg-white">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b">
          Filters
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 rounded mb-1 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b">
          Filters
        </h3>
        <div className="p-4 text-center">
          <div className="text-xl mb-2">⚠️</div>
          <h4 className="text-sm font-semibold text-gray-800 mb-1">Filter Error</h4>
          <p className="text-xs text-gray-600 mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            <option value="">All ({portfolios.length})</option>
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
            <option value="">All ({agencies.length})</option>
            {agencies.slice(0, 10).map(agency => (
              <option key={agency} value={agency}>{agency.substring(0, 30)}...</option>
            ))}
            {agencies.length > 10 && (
              <option value="" disabled>+{agencies.length - 10} more agencies</option>
            )}
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
            <option value="">All ({tiers.length})</option>
            {tiers.map(tier => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
        </div>

        {/* Delivery Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Delivery Status
          </label>
          <select
            value={filters.deliveryStatus[0] || ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              deliveryStatus: e.target.value ? [e.target.value] : []
            })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All ({deliveryStatuses.length})</option>
            {deliveryStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* DCA 2026 Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            DCA 2026
          </label>
          <select
            value={filters.dca2026[0] || ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              dca2026: e.target.value ? [e.target.value] : []
            })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All ({dca2026Values.length})</option>
            {dca2026Values.map(dca => (
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
            dca2026: []
          })}
          className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-1 px-2 rounded text-xs hover:bg-blue-100 transition-colors font-medium"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}