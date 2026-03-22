import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import type {
  DashboardKPI,
  DashboardPayload,
  DCAByTierItem,
  FilterOptions,
  CriticalTimelineGroup,
  CriticalTimelineStats,
  BudgetByPortfolioItem,
  DCAComparisonItem,
} from "@/types/dashboard";
import type { FilterState, ProjectData } from "@/types/project";

const DATASET_PATH = path.join(process.cwd(), "mdpr-2026-project-data.csv");
const EMPTY_FILTERS: FilterState = {
  portfolio: "",
  agency: "",
  tier: "",
  deliveryStatus: "",
  dca2026: "",
};

const DCA_SCORE_MAP: Record<string, number> = {
  High: 5,
  "Medium-High": 4,
  Medium: 3,
  "Medium-Low": 2,
  Low: 1,
};

let cachedProjects: ProjectData[] | null = null;
let cachedAt: string | null = null;

const projectSchema = z.object({
  Portfolio: z.string(),
  Agency: z.string(),
  Tier: z.string(),
  "Project name": z.string().min(1),
  "Project description": z.string(),
  "DCA 2026": z.string(),
  "DCA 2025": z.string(),
  "DCA 2024": z.string(),
  "Delivery status": z.string(),
  "Total budget (millions)": z.number().finite(),
  "Digital budget (millions)": z.number().finite(),
  "Project end date": z.string(),
});

function parseCSVRows(csvText: string): string[][] {
  const text = csvText.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        currentValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }
      row.push(currentValue.trim());
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || row.length > 0) {
    row.push(currentValue.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const normalized = trimmed.toUpperCase();
  if (
    normalized === "N/A" ||
    normalized === "NA" ||
    normalized === "-" ||
    normalized === "NFP" ||
    normalized === "NOT REPORTED"
  ) {
    return "";
  }

  return trimmed;
}

function parseBudget(value: string): number {
  const cleanText = normalizeText(value);
  if (!cleanText) {
    return 0;
  }

  const numericText = cleanText.replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(numericText);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapToProjectData(headers: string[], row: string[]): ProjectData {
  const get = (header: string) => normalizeText(row[headers.indexOf(header)] || "");

  return {
    Portfolio: get("Portfolio"),
    Agency: get("Agency"),
    Tier: get("Tier"),
    "Project name": get("Project name"),
    "Project description": get("Project description"),
    "DCA 2026": get("DCA 2026"),
    "DCA 2025": get("DCA 2025"),
    "DCA 2024": get("DCA 2024"),
    "Delivery status": get("Delivery status"),
    "Total budget (millions)": parseBudget(get("Total budget (millions)")),
    "Digital budget (millions)": parseBudget(get("Digital budget (millions)")),
    "Project end date": get("Project end date"),
  };
}

function parseProjectCSV(csvText: string): ProjectData[] {
  const rows = parseCSVRows(csvText);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  const validProjects: ProjectData[] = [];

  for (const row of rows.slice(1)) {
    const candidate = mapToProjectData(headers, row);
    const parsed = projectSchema.safeParse(candidate);
    if (parsed.success) {
      validProjects.push(parsed.data);
    }
  }

  return validProjects;
}

async function loadProjectsFromDataset(): Promise<ProjectData[]> {
  if (cachedProjects) {
    return cachedProjects;
  }

  const csvText = await readFile(DATASET_PATH, "utf8");
  const projects = parseProjectCSV(csvText);

  cachedProjects = projects;
  cachedAt = new Date().toISOString();

  return projects;
}

function parseProjectDate(dateText: string): Date | null {
  if (!dateText) {
    return null;
  }

  let match = dateText.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (match) {
    return new Date(Number.parseInt(match[3], 10), Number.parseInt(match[2], 10) - 1, Number.parseInt(match[1], 10));
  }

  match = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return new Date(Number.parseInt(match[1], 10), Number.parseInt(match[2], 10) - 1, Number.parseInt(match[3], 10));
  }

  match = dateText.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    const parsed = new Date(`${match[1]} 1, ${match[2]}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  match = dateText.match(/^(\d{4})$/);
  if (match) {
    return new Date(Number.parseInt(match[1], 10), 11, 31);
  }

  const parsed = new Date(dateText);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getQuarter(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}

function applyFilters(projects: ProjectData[], filters: FilterState): ProjectData[] {
  return projects.filter((project) => {
    if (filters.portfolio && project.Portfolio !== filters.portfolio) {
      return false;
    }
    if (filters.agency && project.Agency !== filters.agency) {
      return false;
    }
    if (filters.tier && project.Tier !== filters.tier) {
      return false;
    }
    if (filters.deliveryStatus && project["Delivery status"] !== filters.deliveryStatus) {
      return false;
    }
    if (filters.dca2026 && project["DCA 2026"] !== filters.dca2026) {
      return false;
    }
    return true;
  });
}

function uniqueSortedValues(projects: ProjectData[], key: keyof ProjectData): string[] {
  const values = new Set<string>();
  for (const project of projects) {
    const value = String(project[key] || "").trim();
    if (value) {
      values.add(value);
    }
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function buildFilterOptions(projects: ProjectData[]): FilterOptions {
  return {
    portfolios: uniqueSortedValues(projects, "Portfolio"),
    agencies: uniqueSortedValues(projects, "Agency"),
    tiers: uniqueSortedValues(projects, "Tier"),
    statuses: uniqueSortedValues(projects, "Delivery status"),
    dcaLevels: uniqueSortedValues(projects, "DCA 2026"),
  };
}

function buildKpis(projects: ProjectData[]): DashboardKPI {
  const activeProjects = projects.filter((p) => p["Delivery status"].toLowerCase() === "active").length;
  const totalDigitalBudget = projects.reduce((sum, p) => sum + (p["Digital budget (millions)"] || 0), 0);

  const highRiskProjects = projects.filter((p) => {
    const dca = p["DCA 2025"].toLowerCase();
    return dca === "low" || dca === "medium-low";
  }).length;

  const tier12Projects = projects.filter((p) => {
    const tier = p.Tier.toLowerCase();
    return tier === "tier 1" || tier === "tier 2";
  });

  const healthyTier12 = tier12Projects.filter((p) => {
    const dca = p["DCA 2025"].toLowerCase();
    return dca === "high" || dca === "medium-high";
  }).length;

  const healthyPercentage = tier12Projects.length > 0 ? Math.round((healthyTier12 / tier12Projects.length) * 100) : 0;

  return {
    activeProjects,
    totalProjects: projects.length,
    totalDigitalBudget,
    highRiskProjects,
    healthyTier12,
    tier12Projects: tier12Projects.length,
    healthyPercentage,
  };
}

function buildDcaByTierChart(projects: ProjectData[]): DCAByTierItem[] {
  const tiers = ["Tier 1", "Tier 2", "Tier 3"];

  return tiers.map((tier) => {
    const tierProjects = projects.filter((project) => project.Tier === tier);

    return {
      name: tier,
      High: tierProjects.filter((p) => p["DCA 2026"] === "High").length,
      "Medium-High": tierProjects.filter((p) => p["DCA 2026"] === "Medium-High").length,
      Medium: tierProjects.filter((p) => p["DCA 2026"] === "Medium").length,
      "Medium-Low": tierProjects.filter((p) => p["DCA 2026"] === "Medium-Low").length,
      Low: tierProjects.filter((p) => p["DCA 2026"] === "Low").length,
    };
  });
}

function buildBudgetByPortfolioChart(projects: ProjectData[]): BudgetByPortfolioItem[] {
  const portfolioBudget = new Map<string, number>();

  for (const project of projects) {
    const portfolio = project.Portfolio || "Unknown";
    const budget = project["Digital budget (millions)"] || 0;
    portfolioBudget.set(portfolio, (portfolioBudget.get(portfolio) || 0) + budget);
  }

  return Array.from(portfolioBudget.entries())
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name,
      fullName: name,
      value: Math.round(value),
    }));
}

function buildDcaComparisonChart(projects: ProjectData[]): DCAComparisonItem[] {
  return projects
    .filter((project) => project["DCA 2025"] && project["DCA 2026"])
    .slice(0, 15)
    .map((project) => ({
      name:
        project["Project name"].length > 12
          ? `${project["Project name"].substring(0, 12)}...`
          : project["Project name"],
      fullName: project["Project name"],
      agency: project.Agency,
      "DCA 2025": DCA_SCORE_MAP[project["DCA 2025"]] || 0,
      "DCA 2026": DCA_SCORE_MAP[project["DCA 2026"]] || 0,
      dca2025Text: project["DCA 2025"],
      dca2026Text: project["DCA 2026"],
      change: (DCA_SCORE_MAP[project["DCA 2026"]] || 0) - (DCA_SCORE_MAP[project["DCA 2025"]] || 0),
    }));
}

function buildCriticalTimeline(projects: ProjectData[]): {
  groups: CriticalTimelineGroup[];
  stats: CriticalTimelineStats;
} {
  const now = new Date();
  const threeMonthsAhead = new Date();
  threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

  const criticalProjects = projects
    .filter((project) => {
      const dca = project["DCA 2025"].toLowerCase();
      return dca === "low" || dca === "medium-low";
    })
    .map((project) => {
      const endDate = parseProjectDate(project["Project end date"]);
      return {
        name: project["Project name"],
        portfolio: project.Portfolio,
        agency: project.Agency,
        dca: project["DCA 2025"],
        endDate,
        dateStr: project["Project end date"],
        budget: project["Total budget (millions)"],
      };
    })
    .filter((project) => project.endDate)
    .sort((a, b) => a.endDate!.getTime() - b.endDate!.getTime());

  let overdue = 0;
  let upcoming = 0;
  const grouped = new Map<string, CriticalTimelineGroup>();

  for (const project of criticalProjects) {
    const endDate = project.endDate!;
    const quarter = getQuarter(endDate);
    const isOverdue = endDate < now;

    if (isOverdue) {
      overdue++;
    } else if (endDate <= threeMonthsAhead) {
      upcoming++;
    }

    if (!grouped.has(quarter)) {
      grouped.set(quarter, { quarter, projects: [] });
    }

    grouped.get(quarter)!.projects.push({
      name: project.name,
      portfolio: project.portfolio,
      agency: project.agency,
      dca: project.dca,
      budget: project.budget,
      dateStr: project.dateStr,
      isOverdue,
    });
  }

  return {
    groups: Array.from(grouped.values()),
    stats: {
      total: criticalProjects.length,
      overdue,
      upcoming,
    },
  };
}

export async function getDashboardPayload(filters: Partial<FilterState>): Promise<DashboardPayload> {
  const projects = await loadProjectsFromDataset();
  const normalizedFilters: FilterState = {
    ...EMPTY_FILTERS,
    ...filters,
  };

  const filteredProjects = applyFilters(projects, normalizedFilters);

  return {
    metadata: {
      totalProjects: projects.length,
      filteredProjects: filteredProjects.length,
      lastUpdated: cachedAt || new Date().toISOString(),
      source: "local-csv",
    },
    filters: buildFilterOptions(projects),
    appliedFilters: normalizedFilters,
    kpis: buildKpis(filteredProjects),
    charts: {
      dcaByTier: buildDcaByTierChart(filteredProjects),
      budgetByPortfolio: buildBudgetByPortfolioChart(filteredProjects),
      dcaComparison: buildDcaComparisonChart(filteredProjects),
      criticalTimeline: buildCriticalTimeline(filteredProjects),
    },
    projects: filteredProjects,
  };
}

export function parseFiltersFromSearchParams(searchParams: URLSearchParams): FilterState {
  return {
    portfolio: searchParams.get("portfolio") || "",
    agency: searchParams.get("agency") || "",
    tier: searchParams.get("tier") || "",
    deliveryStatus: searchParams.get("deliveryStatus") || "",
    dca2026: searchParams.get("dca2026") || "",
  };
}
