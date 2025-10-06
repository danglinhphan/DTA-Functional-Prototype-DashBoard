'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProjectData, FilterState } from '@/types/project';
import KPIPanel from '@/components/KPIPanel';
import FilterPanel from '@/components/FilterPanel';
import DCAByTierChart from '@/components/DCAByTierChart';
import BudgetByPortfolio from '@/components/BudgetByPortfolio';
import CriticalProjectsTimeline from '@/components/CriticalProjectsTimeline';
import DCAComparisonChart from '@/components/DCAComparisonChart';
import ProjectTable from '@/components/ProjectTable';
import './globals.css';

export default function Dashboard() {
  const [data, setData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    portfolio: [],
    agency: [],
    tier: [],
    deliveryStatus: [],
    dca2025: []
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = forceRefresh ? '/api/projects' : '/api/projects';
      const method = forceRefresh ? 'POST' : 'GET';

      const response = await fetch(url, {
        method,
        headers: forceRefresh ? { 'Content-Type': 'application/json' } : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Handle different response structures
      let projectsData;
      if (forceRefresh && responseData.success) {
        // For POST requests, we need to fetch the data again
        const getResponse = await fetch('/api/projects');
        if (!getResponse.ok) {
          throw new Error(`HTTP error! status: ${getResponse.status}`);
        }
        projectsData = await getResponse.json();
      } else {
        projectsData = responseData;
      }

      // Ensure data is always an array
      if (!Array.isArray(projectsData)) {
        console.warn('Received non-array data, falling back to sample data');
        setData(getSampleData());
      } else {
        setData(projectsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
      // Fallback to sample data
      setData(getSampleData());
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    // Ensure data is always an array before filtering
    if (!Array.isArray(data)) {
      console.warn('Data is not an array, returning empty array');
      return [];
    }
    
    return data.filter(project => {
      return (
        (filters.portfolio.length === 0 || filters.portfolio.includes(project.Portfolio)) &&
        (filters.agency.length === 0 || filters.agency.includes(project.Agency)) &&
        (filters.tier.length === 0 || filters.tier.includes(project.Tier)) &&
        (filters.deliveryStatus.length === 0 || filters.deliveryStatus.includes(project['Delivery status'])) &&
        (filters.dca2025.length === 0 || filters.dca2025.includes(project['DCA 2025'] || 'Not reported'))
      );
    });
  }, [data, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project data...</p>
          <p className="text-sm text-gray-500">This may take a few seconds for large datasets</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => loadData(false)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
            <button
              onClick={() => loadData(true)}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Force Refresh
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Using sample data as fallback
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Filters Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <FilterPanel
                data={data}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <FilterPanel
              data={data}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <header className="bg-white shadow-sm border-b sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14 lg:h-12">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                    aria-label="Open filters"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </button>
                  <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                    DTA Digital Projects Dashboard
                  </h1>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <button
                    onClick={() => loadData(true)}
                    disabled={loading}
                    className="px-3 py-2 lg:px-3 lg:py-1 text-sm lg:text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-h-[44px] lg:min-h-0"
                    title="Refresh data from source"
                  >
                    <span className="text-sm">🔄</span>
                    <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <div className="text-xs lg:text-xs text-gray-500 hidden sm:block">
                    Updated: {new Date().toLocaleDateString('en-AU')}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-3 lg:p-4 overflow-y-auto">
            {/* KPI Section */}
            <div className="mb-4 lg:mb-3">
              <KPIPanel data={filteredData} />
            </div>

            {/* Charts Section - Mobile: Stack vertically, Desktop: Grid */}
            <div className="space-y-4 lg:grid lg:grid-cols-4 lg:gap-3 lg:space-y-0 lg:mb-3">
              {/* Critical Projects Timeline */}
              <div className="lg:col-span-1">
                <CriticalProjectsTimeline data={filteredData} />
              </div>

              {/* Charts */}
              <div className="lg:col-span-1">
                <DCAByTierChart data={filteredData} />
              </div>
              <div className="lg:col-span-2">
                <BudgetByPortfolio data={filteredData} />
              </div>
            </div>

            {/* Bottom Section - Mobile: Stack, Desktop: 2 columns */}
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              <DCAComparisonChart data={filteredData} />
              <ProjectTable data={filteredData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample data fallback
function getSampleData(): ProjectData[] {
  return [
    {
      Portfolio: "Attorney-General's",
      Agency: "Australian Criminal Intelligence Commission",
      Tier: 'Tier 1',
      'Project name': 'National Criminal Intelligence System (NCIS)',
      'DCA 2024': 'Medium-High',
      'DCA 2025': 'Medium',
      'Delivery status': 'Active',
      'Total budget (millions)': 373.7,
      'Digital budget (millions)': 373.7,
      'Project end date': '30.06.2027',
      'Project description': 'The NCIS will provide secure access to a national view of criminal information and intelligence.'
    },
    {
      Portfolio: "Agriculture, Fisheries and Forestry",
      Agency: "Department of Agriculture, Fisheries and Forestry",
      Tier: 'Tier 2',
      'Project name': 'Capital Security, Technology and Asset Refresh (CapSTAR)',
      'DCA 2024': '',
      'DCA 2025': 'Medium-High',
      'Delivery status': 'Active',
      'Total budget (millions)': 279,
      'Digital budget (millions)': 189.8,
      'Project end date': '30.06.2028',
      'Project description': 'The CapSTAR program aims to refresh and maintain essential property and ICT assets.'
    },
    {
      Portfolio: "Attorney-General's",
      Agency: "Australian Federal Police",
      Tier: 'Tier 3',
      'Project name': 'Investigation Management Solution (IMS) Program',
      'DCA 2024': '',
      'DCA 2025': 'High',
      'Delivery status': 'Active',
      'Total budget (millions)': 45,
      'Digital budget (millions)': 45,
      'Project end date': '30.06.2025',
      'Project description': 'The IMS is providing the Australian Federal Police (AFP) with the ability to manage investigative processes.'
    }
  ];
}