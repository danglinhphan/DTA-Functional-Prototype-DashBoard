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

const DATA_GOV_AU_PACKAGE_ID = 'd41c5c1c-1bae-4871-af56-1eca5b340039';

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
    // Try to load from API first
    const apiProjects = await fetchProjectDataFromAPI();
    let finalProjects = apiProjects;

    if (finalProjects.length > 0) {
      console.log(`Loaded ${finalProjects.length} projects from data.gov.au API`);
    } else {
      // Fallback
      console.log('No data found from API, returning sample data');
      finalProjects = getSampleData();
    }

    const data: OptimizedData = {
      projects: finalProjects,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalProjects: finalProjects.length,
        dataSources: [
          { file: 'data.gov.au API', count: finalProjects.length, type: 'api' }
        ],
        lastUpdated: new Date().toISOString()
      },
      aggregations: {
        portfolios: [...new Set(finalProjects.map(p => p.Portfolio))].sort(),
        agencies: [...new Set(finalProjects.map(p => p.Agency))].sort(),
        tiers: [...new Set(finalProjects.map(p => p.Tier))].sort(),
        deliveryStatuses: [...new Set(finalProjects.map(p => p['Delivery status']))].sort(),
        dcaLevels: [...new Set(finalProjects.map(p => p['DCA 2026'] || 'Not reported'))].sort(),
        totalBudget: finalProjects.reduce((sum, p) => sum + (Number(p['Total budget (millions)']) || 0), 0),
        digitalBudget: finalProjects.reduce((sum, p) => sum + (Number(p['Digital budget (millions)']) || 0), 0),
        projectCount: finalProjects.length
      }
    };

    cachedData = data;
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
  const sample = getSampleData();
  return {
    projects: sample,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalProjects: sample.length,
      dataSources: [{ file: 'fallback', count: sample.length, type: 'fallback' }],
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
      projectCount: sample.length
    }
  };
}

async function fetchProjectDataFromAPI(): Promise<ProjectData[]> {
  try {
    const response = await fetch(`https://data.gov.au/data/api/3/action/package_show?id=${DATA_GOV_AU_PACKAGE_ID}`);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.success) return [];

    // Find the Project Data CSV resource
    const csvResource = data.result.resources.find((r: any) =>
      r.name.includes('Project Data') && r.format.toLowerCase() === '.csv'
    );

    if (!csvResource) return [];

    const csvResponse = await fetch(csvResource.url);
    if (!csvResponse.ok) return [];

    const csvContent = await csvResponse.text();
    return parseCSVContent(csvContent);
  } catch (error) {
    console.error('API Fetch error:', error);
    return [];
  }
}

function parseCSVContent(csvContent: string): ProjectData[] {
  // Normalize and remove BOM
  const normalized = csvContent.replace(/^\uFEFF/, '');
  const lines = splitCSVRows(normalized);
  const headerLineIndex = lines.findIndex(l => l.trim().length > 0);
  if (headerLineIndex === -1) return [];

  const headers = parseCSVLine(lines[headerLineIndex]).map(h => h.replace(/"/g, '').trim());

  const records: ProjectData[] = [];
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);
    const record: any = {};

    headers.forEach((header, index) => {
      let val = (values[index] || '').trim().replace(/"/g, '');
      if (val.toUpperCase() === 'N/A' || val.toUpperCase() === 'NA') val = '';
      record[header] = val;
    });

    records.push({
      Portfolio: record.Portfolio || '',
      Agency: record.Agency || '',
      Tier: record.Tier || 'Tier 3',
      'Project name': record['Project name'] || '',
      'DCA 2024': record['DCA 2024'] || record['DCA 2025'] || '',
      'DCA 2025': record['DCA 2025'] || '',
      'DCA 2026': record['DCA 2026'] || '',
      'Delivery status': record['Delivery status'] || 'Active',
      'Total budget (millions)': parseFloat(record['Total budget (millions)']) || 0,
      'Digital budget (millions)': parseFloat(record['Digital budget (millions)']) || 0,
      'Project end date': record['Project end date'] || '',
      'Project description': record['Project description'] || '',
    });
  }
  return records;
}


function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map(item => item.replace(/^"|"$/g, ''));
}

// Split CSV content into rows but don't split when inside quoted fields.
function splitCSVRows(content: string): string[] {
  const rows: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      // Toggle quote state. Handle escaped double-quotes by checking next char
      if (inQuotes && next === '"') {
        // Escaped quote, include one quote and skip the next
        current += '"';
        i++; // skip escaped quote
        continue;
      }
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === '\n' || (char === '\r' && next === '\n')) && !inQuotes) {
      // End of row. If CRLF, consume both
      // For CRLF sequence, consume '\r' here and let loop skip '\n' next iteration, so handle both
      // Normalize: push current and clear
      rows.push(current);
      current = '';
      if (char === '\r' && next === '\n') i++; // skip the LF char
    } else {
      current += char;
    }
  }

  // push any remaining content as last row
  if (current.length > 0) rows.push(current);

  return rows;
}

function getSampleData(): ProjectData[] {
  return [
    {
      Portfolio: "Attorney-General's",
      Agency: "Australian Criminal Intelligence Commission",
      Tier: 'Tier 1',
      'Project name': 'National Criminal Intelligence System (NCIS)',
      'DCA 2024': 'Medium-High',
      'DCA 2025': 'Medium',
      'DCA 2026': 'Medium',
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
      'DCA 2026': 'High',
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
      'DCA 2026': 'High',
      'Delivery status': 'Active',
      'Total budget (millions)': 45,
      'Digital budget (millions)': 45,
      'Project end date': '30.06.2025',
      'Project description': 'The IMS is providing the Australian Federal Police (AFP) with the ability to manage investigative processes.'
    }
  ];
}