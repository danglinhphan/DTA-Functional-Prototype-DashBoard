import { ProjectData } from '@/types/project';
import fs from 'fs';
import path from 'path';

const DATA_GOV_AU_PACKAGE_ID = 'd41c5c1c-1bae-4871-af56-1eca5b340039';

export async function loadProjectData(): Promise<ProjectData[]> {
  try {
    // Try to load from API first
    const apiProjects = await fetchProjectDataFromAPI();
    if (apiProjects.length > 0) {
      console.log(`Loaded ${apiProjects.length} projects from data.gov.au API`);
      return apiProjects;
    }

    const allProjects: ProjectData[] = [];

    // Fallback to local datasets
    const csvPath1 = path.join(process.cwd(), 'mdpr-dataset-project-data-1.csv');
    if (fs.existsSync(csvPath1)) {
      console.log('Loading mdpr-dataset-project-data-1.csv');
      const projects1 = loadCSVFile(csvPath1);
      allProjects.push(...projects1);
    }

    const csvPath2 = path.join(process.cwd(), 'digital-project-data_v2.csv');
    if (fs.existsSync(csvPath2)) {
      console.log('Loading digital-project-data_v2.csv');
      const projects2 = loadCSVFile(csvPath2);
      allProjects.push(...projects2);
    }

    if (allProjects.length === 0) {
      console.log('No data found, returning sample data');
      return getSampleData();
    }

    return allProjects;
  } catch (error) {
    console.error('Error loading project data:', error);
    return getSampleData();
  }
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

function loadCSVFile(csvPath: string): ProjectData[] {
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    // Normalize and remove BOM if present
    const normalized = csvContent.replace(/^\uFEFF/, '');

    // Split into rows while respecting quoted fields that may contain newlines
    const lines = splitCSVRows(normalized);
    // Find the first non-empty line to use as headers
    const headerLineIndex = lines.findIndex(l => l.trim().length > 0);
    if (headerLineIndex === -1) return [];
    const headers = parseCSVLine(lines[headerLineIndex]).map(h => h.replace(/"/g, '').trim());

    const records: ProjectData[] = [];
    for (let i = headerLineIndex + 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = parseCSVLine(lines[i]);
      const record: any = {};

      // Normalize common 'not available' markers (e.g., 'N/A', 'NA') to empty string
      const normalizeValue = (v: any) => {
        if (v === undefined || v === null) return '';
        const s = String(v).trim();
        if (s.toUpperCase() === 'N/A' || s.toUpperCase() === 'NA') return '';
        return s;
      };

      headers.forEach((header, index) => {
        record[header] = normalizeValue(values[index] || '');
      });

      records.push({
        Portfolio: record.Portfolio || '',
        Agency: record.Agency || '',
        Tier: record.Tier || 'Tier 3',
        'Project name': record['Project name'] || '',
        'DCA 2024': record['DCA 2024'] || '',
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
  } catch (error) {
    console.error(`Error loading ${csvPath}:`, error);
    return [];
  }
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