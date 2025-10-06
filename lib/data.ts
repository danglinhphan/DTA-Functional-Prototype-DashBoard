import { ProjectData } from '@/types/project';

export interface OptimizedData {
  projects: ProjectData[];
  metadata: {
    generatedAt: string;
    totalProjects: number;
    dataSources: Array<{
      file: string;
      count: number;
      type: string;
    }>;
    lastUpdated: string;
  };
  aggregations: {
    portfolios: string[];
    agencies: string[];
    tiers: string[];
    deliveryStatuses: string[];
    dcaLevels: string[];
    totalBudget: number;
    digitalBudget: number;
    projectCount: number;
  };
}

let cachedData: OptimizedData | null = null;

export async function loadProjectData(): Promise<ProjectData[]> {
  const data = await loadOptimizedData();
  return data.projects;
}

export async function loadOptimizedData(): Promise<OptimizedData> {
  // Return cached data if available
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('/data.json');
    if (!response.ok) {
      throw new Error('Failed to load data.json');
    }
    
    const data = await response.json();
    cachedData = data; // Cache for subsequent calls
    return data;
  } catch (error) {
    console.error('Error loading optimized data:', error);
    return getFallbackData();
  }
}

export function getDCAColor(dca: string): string {
  const dcaColors: Record<string, string> = {
    'High': '#10b981',
    'Medium-High': '#84cc16', 
    'Medium': '#f59e0b',
    'Medium-Low': '#f97316',
    'Low': '#ef4444',
    'Not reported': '#6b7280',
    '': '#6b7280',
  };
  return dcaColors[dca] || '#6b7280';
}

export function getDCARiskLevel(dca: string): 'healthy' | 'risk' | 'unknown' {
  if (dca === 'High' || dca === 'Medium-High') return 'healthy';
  if (dca === 'Low' || dca === 'Medium-Low') return 'risk';
  return 'unknown';
}

function getFallbackData(): OptimizedData {
  return {
    projects: [
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
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      totalProjects: 3,
      dataSources: [{ file: 'fallback', count: 3, type: 'fallback' }],
      lastUpdated: new Date().toISOString()
    },
    aggregations: {
      portfolios: ["Attorney-General's", "Agriculture, Fisheries and Forestry"],
      agencies: ["Australian Criminal Intelligence Commission", "Department of Agriculture, Fisheries and Forestry", "Australian Federal Police"],
      tiers: ["Tier 1", "Tier 2", "Tier 3"],
      deliveryStatuses: ["Active"],
      dcaLevels: ["Medium", "Medium-High", "High"],
      totalBudget: 697.7,
      digitalBudget: 608.5,
      projectCount: 3
    }
  };
}