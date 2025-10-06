// types/project.ts
export interface ProjectData {
  Portfolio: string;
  Agency: string;
  Tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  'Project name': string;
  'DCA 2024': string;
  'DCA 2025': string;
  'Delivery status': 'Active' | 'Closed';
  'Total budget (millions)': number;
  'Digital budget (millions)': number;
  'Project end date': string;
  'Project description': string;
}

export type DCALevel = 'High' | 'Medium-High' | 'Medium' | 'Medium-Low' | 'Low' | 'Not reported' | '';

export interface FilterState {
  portfolio: string[];
  agency: string[];
  tier: string[];
  deliveryStatus: string[];
  dca2025: string[];
}

export interface KPIData {
  totalActiveProjects: number;
  totalDigitalBudget: number;
  highRiskProjects: number;
  healthyTier12Percentage: number;
}