'use client';

import { ProjectData } from '@/types/project';
import { useMemo, useState, useEffect } from 'react';

interface CriticalProjectsTimelineProps {
  data: ProjectData[];
}

export default function CriticalProjectsTimeline({ data }: CriticalProjectsTimelineProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset states when data changes
  useEffect(() => {
    setError(null);
    setRetryCount(0);
  }, [data]);

  const timelineData = useMemo(() => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate input data
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
      }

      // Get critical projects (DCA Low/Medium-Low)
      const criticalProjects = data.filter(project => {
        if (!project || typeof project !== 'object') {
          console.warn('Invalid project object:', project);
          return false;
        }

        const dcaValue = project['DCA 2025'];
        return dcaValue === 'Low' || dcaValue === 'Medium-Low';
      });

      if (criticalProjects.length === 0) {
        // This is not an error, just no critical projects
        setIsProcessing(false);
        return [];
      }

      // Process projects with detailed information for timeline
      const processedProjects = criticalProjects.map((project, index) => {
        try {
          let endDate = new Date();
          let year = 'Unknown';

          if (project['Project end date']) {
            const endDateStr = project['Project end date'].toString().trim();

            // Validate date string
            if (!endDateStr || endDateStr.length === 0) {
              console.warn(`Project ${index}: Empty end date`);
              return null;
            }

            // Try different date formats
            const dateFormats = [
              // DD.MM.YYYY format
              /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
              // DD/MM/YYYY format
              /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
              // YYYY-MM-DD format
              /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
              // Just year
              /^(\d{4})$/
            ];

            let parsed = false;
            for (const format of dateFormats) {
              const match = endDateStr.match(format);
              if (match) {
                if (format === dateFormats[0] || format === dateFormats[1]) {
                  // DD.MM.YYYY or DD/MM/YYYY
                  const day = parseInt(match[1]);
                  const month = parseInt(match[2]) - 1; // JS months are 0-indexed
                  const yearNum = parseInt(match[3]);

                  // Validate date components
                  if (day < 1 || day > 31 || month < 0 || month > 11 || yearNum < 2000 || yearNum > 2030) {
                    console.warn(`Project ${index}: Invalid date components: ${day}/${month + 1}/${yearNum}`);
                    continue;
                  }

                  endDate = new Date(yearNum, month, day);
                  year = match[3];
                } else if (format === dateFormats[2]) {
                  // YYYY-MM-DD
                  const yearNum = parseInt(match[1]);
                  const month = parseInt(match[2]) - 1;
                  const day = parseInt(match[3]);

                  if (yearNum < 2000 || yearNum > 2030 || month < 0 || month > 11 || day < 1 || day > 31) {
                    console.warn(`Project ${index}: Invalid date components: ${yearNum}-${month + 1}-${day}`);
                    continue;
                  }

                  endDate = new Date(yearNum, month, day);
                  year = match[1];
                } else if (format === dateFormats[3]) {
                  // Just year
                  const yearNum = parseInt(match[1]);
                  if (yearNum < 2000 || yearNum > 2030) {
                    console.warn(`Project ${index}: Invalid year: ${yearNum}`);
                    continue;
                  }
                  endDate = new Date(yearNum, 11, 31);
                  year = match[1];
                }
                parsed = true;
                break;
              }
            }

            if (!parsed) {
              console.warn(`Project ${index}: Could not parse date: ${endDateStr}`);
              return null;
            }
          } else {
            console.warn(`Project ${index}: Missing end date`);
            return null;
          }

          // Validate required fields
          const projectName = project['Project name'];
          const portfolio = project.Portfolio;
          const agency = project.Agency;
          const dca = project['DCA 2025'];
          const budget = project['Total budget (millions)'];

          if (!projectName || !portfolio || !agency || !dca) {
            console.warn(`Project ${index}: Missing required fields`, { projectName, portfolio, agency, dca });
            return null;
          }

          return {
            name: projectName,
            portfolio,
            agency,
            dca,
            endDate,
            year,
            budget: typeof budget === 'number' ? budget : (typeof budget === 'string' ? parseFloat(budget) || 0 : 0),
            dateStr: project['Project end date']
          };
        } catch (projectError) {
          console.error(`Error processing project ${index}:`, projectError);
          return null;
        }
      }).filter(Boolean); // Remove null entries

      // Sort by end date
      processedProjects.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());

      setIsProcessing(false);
      return processedProjects;
    } catch (err) {
      console.error('Error processing timeline data:', err);
      setError(err instanceof Error ? err.message : 'Failed to process timeline data');
      setIsProcessing(false);
      return [];
    }
  }, [data, retryCount]); // Include retryCount to trigger re-processing

  // Group projects by quarters for timeline display
  const quarterGroups = useMemo(() => {
    if (error || isProcessing) return [];

    try {
      const groups: { [key: string]: typeof timelineData } = {};

      timelineData.forEach(project => {
        try {
          const year = project.endDate.getFullYear();
          const quarter = Math.floor(project.endDate.getMonth() / 3) + 1;
          const key = `Q${quarter} ${year}`;

          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(project);
        } catch (groupError) {
          console.error('Error grouping project:', groupError, project);
        }
      });

      return Object.entries(groups).sort((a, b) => {
        // Extract year and quarter for proper sorting
        const [quarterA, yearA] = a[0].split(' ');
        const [quarterB, yearB] = b[0].split(' ');
        const yearDiff = parseInt(yearA) - parseInt(yearB);
        if (yearDiff !== 0) return yearDiff;
        return parseInt(quarterA.replace('Q', '')) - parseInt(quarterB.replace('Q', ''));
      });
    } catch (err) {
      console.error('Error creating quarter groups:', err);
      setError('Failed to organize timeline data');
      return [];
    }
  }, [timelineData, error, isProcessing]);

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  const getDCAColor = (dca: string) => {
    return dca === 'Low' ? '#dc2626' : '#f97316';
  };

  const getRiskIcon = (dca: string) => {
    return dca === 'Low' ? '🚨' : '⚠️';
  };

  const today = new Date();
  const isOverdue = (endDate: Date) => endDate < today;
  const isUpcoming = (endDate: Date) => {
    const timeDiff = endDate.getTime() - today.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 90 && daysDiff > 0;
  };

  // Loading state
  if (isProcessing) {
    return (
      <div className="bg-white p-3 rounded-lg shadow">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Critical Projects Timeline
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Processing timeline data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-3 rounded-lg shadow">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Critical Projects Timeline
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="text-3xl mb-2">⚠️</div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Data Processing Error</h4>
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

  return (
    <div className="bg-white p-3 rounded-lg shadow">
      <h3 className="text-md font-semibold text-gray-800 mb-2">
        Critical Projects Timeline
      </h3>
      <p className="text-xs text-gray-600 mb-3">DCA Low/Medium-Low projects organized by end date</p>

      {timelineData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-sm">No critical projects found</p>
            <p className="text-xs">Projects with DCA Low or Medium-Low</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-72 overflow-y-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded p-2">
            <div>
              <div className="text-lg font-bold text-red-600">{timelineData.filter(p => isOverdue(p.endDate)).length}</div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{timelineData.filter(p => isUpcoming(p.endDate)).length}</div>
              <div className="text-xs text-gray-600">Next 90 Days</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-700">{timelineData.length}</div>
              <div className="text-xs text-gray-600">Total Critical</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>

            {quarterGroups.map(([quarter, projects], index) => (
              <div key={quarter} className="relative mb-6">
                {/* Quarter marker */}
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow relative z-10"></div>
                  <div className="ml-3 font-semibold text-sm text-gray-800">{quarter}</div>
                  <div className="ml-2 text-xs text-gray-500">({projects.length} projects)</div>
                </div>

                {/* Projects for this quarter */}
                <div className="ml-6 space-y-2">
                  {projects.slice(0, 3).map((project, projIndex) => {
                    const isProjectOverdue = isOverdue(project.endDate);
                    const isProjectUpcoming = isUpcoming(project.endDate);

                    return (
                      <div
                        key={projIndex}
                        className={`p-2 rounded border-l-4 ${
                          isProjectOverdue
                            ? 'border-red-500 bg-red-50'
                            : isProjectUpcoming
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-sm">{getRiskIcon(project.dca)}</span>
                              <span className="text-xs font-medium truncate" title={project.name}>
                                {project.name.length > 30 ? project.name.substring(0, 27) + '...' : project.name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 truncate" title={project.portfolio}>
                              {project.portfolio}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="px-1.5 py-0.5 text-xs font-medium rounded text-white"
                                style={{ backgroundColor: getDCAColor(project.dca) }}
                              >
                                {project.dca}
                              </span>
                              <span className="text-xs text-gray-500">
                                ${project.budget.toFixed(1)}M
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <div className="text-xs text-gray-600">
                              {project.dateStr}
                            </div>
                            {isProjectOverdue && (
                              <div className="text-xs text-red-600 font-medium">
                                Overdue
                              </div>
                            )}
                            {isProjectUpcoming && (
                              <div className="text-xs text-orange-600 font-medium">
                                Upcoming
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {projects.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2">
                      +{projects.length - 3} more projects
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}