export interface ProjectData {
  Portfolio: string;
  Agency: string;
  Tier: string;
  "Project name": string;
  "DCA 2024": string;
  "DCA 2025": string;
  "DCA 2026": string;
  "Delivery status": string;
  "Total budget (millions)": number;
  "Digital budget (millions)": number;
  "Project end date": string;
  "Project description": string;
}

export interface FilterState {
  portfolio: string;
  agency: string;
  tier: string;
  deliveryStatus: string;
  dca2026: string;
}

export interface DataLoadResult {
  projects: ProjectData[];
  metadata: {
    totalProjects: number;
    lastUpdated: string;
    source: string;
  };
}

export type DCALevel = "High" | "Medium-High" | "Medium" | "Medium-Low" | "Low";

export const DCA_LEVELS: DCALevel[] = ["High", "Medium-High", "Medium", "Medium-Low", "Low"];

// High-contrast semantic colors for DCA levels (traffic light system)
export const DCA_COLORS: Record<DCALevel, string> = {
  High: "#22c55e",           // Bright green - clearly positive
  "Medium-High": "#4ade80",  // Light green - positive leaning
  Medium: "#facc15",         // Bright yellow - neutral/caution
  "Medium-Low": "#fb923c",   // Orange - warning
  Low: "#f87171",            // Red - critical/alert
};

export const TIER_OPTIONS = ["Tier 1", "Tier 2", "Tier 3"];
export const DELIVERY_STATUS_OPTIONS = ["Active", "Closed"];
