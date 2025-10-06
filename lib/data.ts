import { ProjectData } from '@/types/project';
import fs from 'fs';
import path from 'path';

export async function loadProjectData(): Promise<ProjectData[]> {
  try {
    const allProjects: ProjectData[] = [];
    
    // Load dataset 1: mdpr-dataset-project-data-1.csv
    const csvPath1 = path.join(process.cwd(), 'mdpr-dataset-project-data-1.csv');
    if (fs.existsSync(csvPath1)) {
      console.log('Loading mdpr-dataset-project-data-1.csv');
      const projects1 = loadCSVFile(csvPath1);
      allProjects.push(...projects1);
    }
    
    // Load dataset 2: digital-project-data_v2.csv
    const csvPath2 = path.join(process.cwd(), 'digital-project-data_v2.csv');
    if (fs.existsSync(csvPath2)) {
      console.log('Loading digital-project-data_v2.csv');
      const projects2 = loadCSVFile(csvPath2);
      allProjects.push(...projects2);
    }
    
    if (allProjects.length === 0) {
      console.log('No CSV files found, returning sample data');
      return getSampleData();
    }
    
    console.log(`Total projects loaded: ${allProjects.length}`);
    return allProjects;
  } catch (error) {
    console.error('Error loading project data:', error);
    return getSampleData();
  }
}

function loadCSVFile(csvPath: string): ProjectData[] {
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const records: ProjectData[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      const record: any = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      
      records.push({
        Portfolio: record.Portfolio || '',
        Agency: record.Agency || '',
        Tier: record.Tier || 'Tier 3',
        'Project name': record['Project name'] || '',
        'DCA 2024': record['DCA 2024'] || '',
        'DCA 2025': record['DCA 2025'] || '',
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