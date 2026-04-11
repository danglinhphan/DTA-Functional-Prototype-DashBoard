import type { FilterState, ProjectData } from "@/types/project";

export interface DashboardMetadata {
  totalProjects: number;
  filteredProjects: number;
  lastUpdated: string;
  source: string;
}

export interface DashboardKPI {
  activeProjects: number;
  totalProjects: number;
  totalDigitalBudget: number;
  highRiskProjects: number;
  healthyTier12: number;
  tier12Projects: number;
  healthyPercentage: number;
}

export interface DCAByTierItem {
  name: string;
  High: number;
  "Medium-High": number;
  Medium: number;
  "Medium-Low": number;
  Low: number;
}

export interface BudgetByPortfolioItem {
  name: string;
  fullName: string;
  value: number;
}

export interface DCAComparisonItem {
  name: string;
  fullName: string;
  agency: string;
  "DCA 2025": number;
  "DCA 2026": number;
  dca2025Text: string;
  dca2026Text: string;
  change: number;
}

export interface CriticalTimelineProject {
  name: string;
  portfolio: string;
  agency: string;
  dca: string;
  dateStr: string;
  budget: number;
  isOverdue: boolean;
}

export interface CriticalTimelineGroup {
  quarter: string;
  projects: CriticalTimelineProject[];
}

export interface CriticalTimelineStats {
  total: number;
  overdue: number;
  upcoming: number;
}

export interface FilterOptions {
  portfolios: string[];
  agencies: string[];
  tiers: string[];
  statuses: string[];
  dcaLevels: string[];
}

export interface DashboardCharts {
  dcaByTier: DCAByTierItem[];
  budgetByPortfolio: BudgetByPortfolioItem[];
  dcaComparison: DCAComparisonItem[];
  criticalTimeline: {
    groups: CriticalTimelineGroup[];
    stats: CriticalTimelineStats;
  };
}

export interface DashboardPayload {
  metadata: DashboardMetadata;
  filters: FilterOptions;
  appliedFilters: FilterState;
  kpis: DashboardKPI;
  charts: DashboardCharts;
  projects: ProjectData[];
}
