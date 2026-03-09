'use client';

import { ProjectData } from '@/types/project';
import { useState, useMemo, useEffect } from 'react';

interface ProjectTableProps {
  data: ProjectData[];
}

export default function ProjectTable({ data }: ProjectTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ProjectData>('Project name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset states when data changes
  useEffect(() => {
    setError(null);
    setRetryCount(0);
    setCurrentPage(1);
  }, [data]);

  const { filteredData, sortedData, paginatedData, totalPages } = useMemo(() => {
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
          filteredData: [],
          sortedData: [],
          paginatedData: [],
          totalPages: 0
        };
      }

      // Remove rows with empty or missing Project name (normalized 'N/A' becomes empty string in loader)
      const cleanData = data.filter(p => {
        try {
          return p && typeof p === 'object' && ((p['Project name'] || '').toString().trim().length > 0);
        } catch (err) {
          return false;
        }
      });

      if (cleanData.length === 0) {
        setIsProcessing(false);
        return {
          filteredData: [],
          sortedData: [],
          paginatedData: [],
          totalPages: 0
        };
      }

      // Safe filtering with error handling
      const filtered = cleanData.filter(project => {
        try {
          if (!project || typeof project !== 'object') {
            console.warn('Invalid project data:', project);
            return false;
          }

          const projectName = (project['Project name'] || '').toString().toLowerCase();
          const agency = (project.Agency || '').toString().toLowerCase();
          const portfolio = (project.Portfolio || '').toString().toLowerCase();
          const searchLower = searchTerm.toLowerCase();

          return projectName.includes(searchLower) ||
            agency.includes(searchLower) ||
            portfolio.includes(searchLower);
        } catch (err) {
          console.warn('Error filtering project:', err, project);
          return false;
        }
      });

      // Safe sorting with error handling
      const sorted = [...filtered].sort((a, b) => {
        try {
          let aValue: any = a[sortField];
          let bValue: any = b[sortField];

          // Handle numeric fields safely
          if (sortField === 'Total budget (millions)' || sortField === 'Digital budget (millions)') {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
          } else {
            // Convert to strings for comparison
            aValue = (aValue || '').toString();
            bValue = (bValue || '').toString();
          }

          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        } catch (err) {
          console.warn('Error sorting projects:', err, a, b);
          return 0;
        }
      });

      const totalPages = Math.ceil(sorted.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

      setIsProcessing(false);
      return {
        filteredData: filtered,
        sortedData: sorted,
        paginatedData: paginated,
        totalPages
      };
    } catch (err) {
      console.error('Error processing table data:', err);
      setError(err instanceof Error ? err.message : 'Failed to process table data');
      setIsProcessing(false);
      return {
        filteredData: [],
        sortedData: [],
        paginatedData: [],
        totalPages: 0
      };
    }
  }, [data, searchTerm, sortField, sortDirection, currentPage, itemsPerPage, retryCount]);

  const handleSort = (field: keyof ProjectData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  const getDCAColor = (dca: string) => {
    const colors: Record<string, string> = {
      'High': 'bg-green-100 text-green-800',
      'Medium-High': 'bg-lime-100 text-lime-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Medium-Low': 'bg-orange-100 text-orange-800',
      'Low': 'bg-red-100 text-red-800',
      'Not reported': 'bg-gray-100 text-gray-800',
    };
    return colors[dca] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (isProcessing) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Project Details Table</h3>
          <div className="mb-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Project Details Table</h3>
        </div>
        <div className="p-8 text-center">
          <div className="text-xl mb-2">⚠️</div>
          <h4 className="text-sm font-semibold text-gray-800 mb-1">Table Error</h4>
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
    <div className="bg-white rounded-lg shadow min-w-0">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-md font-semibold text-gray-800 mb-2">Project Details Table</h3>

        {/* Search */}
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 border border-gray-300 rounded text-xs"
          />
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          Showing {paginatedData.length} of {sortedData.length} projects
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-w-0">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                style={{ width: '30%' }}
                onClick={() => handleSort('Project name')}
              >
                Project Name {sortField === 'Project name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                style={{ width: '20%' }}
                onClick={() => handleSort('Agency')}
              >
                Agency {sortField === 'Agency' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                style={{ width: '10%' }}
                onClick={() => handleSort('Tier')}
              >
                Tier {sortField === 'Tier' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                style={{ width: '12%' }}
                onClick={() => handleSort('DCA 2026')}
              >
                DCA 2026 {sortField === 'DCA 2026' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                style={{ width: '10%' }}
                onClick={() => handleSort('Delivery status')}
              >
                Status {sortField === 'Delivery status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                style={{ width: '10%' }}
                onClick={() => handleSort('Digital budget (millions)')}
              >
                Budget (M) {sortField === 'Digital budget (millions)' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                style={{ width: '8%' }}
                onClick={() => handleSort('Project end date')}
              >
                End Date {sortField === 'Project end date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((project, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-2 align-top">
                  <div className="text-sm font-medium text-gray-900 truncate" title={project['Project name'] || ''}>
                    {project['Project name'] || 'N/A'}
                  </div>
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="text-sm text-gray-900 truncate" title={project.Agency || ''}>
                    {project.Agency || 'N/A'}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {project.Tier || 'N/A'}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap hidden md:table-cell">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDCAColor(project['DCA 2026'] || 'Not reported')}`}>
                    {project['DCA 2026'] || 'Not reported'}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap hidden lg:table-cell">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(project['Delivery status'] || '').toString() === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {project['Delivery status'] || 'N/A'}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                  ${(Number(project['Digital budget (millions)']) || 0).toFixed(1)}M
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                  {project['Project end date'] || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}