import type { ProjectData, DataLoadResult } from "@/types/project";

const PACKAGE_ID = "d41c5c1c-1bae-4871-af56-1eca5b340039";
const API_BASE = "https://data.gov.au/data/api/3/action";

let cachedData: DataLoadResult | null = null;

function parseCSV(csvText: string): ProjectData[] {
  // Remove BOM if present
  const text = csvText.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);

  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  const projects: ProjectData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;

    const project: Record<string, string | number> = {};

    headers.forEach((header, index) => {
      let value = values[index] || "";
      // Normalize N/A values
      if (
        value.toUpperCase() === "N/A" ||
        value.toUpperCase() === "NA" ||
        value === "-"
      ) {
        value = "";
      }
      project[header.trim()] = value;
    });

    // Parse numeric budget fields
    project["Total budget (millions)"] = parseFloat(
      String(project["Total budget (millions)"]) || "0"
    );
    project["Digital budget (millions)"] = parseFloat(
      String(project["Digital budget (millions)"]) || "0"
    );

    if (isNaN(project["Total budget (millions)"] as number)) {
      project["Total budget (millions)"] = 0;
    }
    if (isNaN(project["Digital budget (millions)"] as number)) {
      project["Digital budget (millions)"] = 0;
    }

    projects.push(project as unknown as ProjectData);
  }

  return projects;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function fetchProjectDataFromAPI(): Promise<ProjectData[]> {
  try {
    // Get package metadata
    const metadataResponse = await fetch(
      `${API_BASE}/package_show?id=${PACKAGE_ID}`,
      { signal: AbortSignal.timeout(10000) }
    );
    
    if (!metadataResponse.ok) {
      return [];
    }
    
    const metadataJson = await metadataResponse.json();

    if (!metadataJson.success) {
      return [];
    }

    // Find CSV resource - try multiple search strategies
    const resources = metadataJson.result?.resources || [];
    
    // Strategy 1: Look for "project data" in name
    let csvResource = resources.find(
      (r: { name?: string; format?: string }) =>
        r.name?.toLowerCase().includes("project data") &&
        r.format?.toLowerCase() === "csv"
    );
    
    // Strategy 2: Look for any CSV with "mdpr" or "major digital" in name
    if (!csvResource) {
      csvResource = resources.find(
        (r: { name?: string; format?: string }) =>
          (r.name?.toLowerCase().includes("mdpr") || 
           r.name?.toLowerCase().includes("major digital")) &&
          r.format?.toLowerCase() === "csv"
      );
    }
    
    // Strategy 3: Get the first CSV resource
    if (!csvResource) {
      csvResource = resources.find(
        (r: { format?: string }) => r.format?.toLowerCase() === "csv"
      );
    }

    if (!csvResource || !csvResource.url) {
      // Silently fallback to sample data
      return [];
    }

    // Fetch CSV content
    const csvResponse = await fetch(csvResource.url, {
      signal: AbortSignal.timeout(15000)
    });
    
    if (!csvResponse.ok) {
      return [];
    }
    
    const csvText = await csvResponse.text();
    const projects = parseCSV(csvText);
    
    return projects;
  } catch {
    // Silently fallback to sample data on any error
    return [];
  }
}

export async function loadOptimizedData(): Promise<DataLoadResult> {
  // Return cached data if available
  if (cachedData) {
    return cachedData;
  }

  const apiProjects = await fetchProjectDataFromAPI();
  let finalProjects = apiProjects;

  // If API fails, use sample data
  if (finalProjects.length === 0) {
    finalProjects = getSampleData();
  }

  const result: DataLoadResult = {
    projects: finalProjects,
    metadata: {
      totalProjects: finalProjects.length,
      lastUpdated: new Date().toISOString(),
      source: apiProjects.length > 0 ? "data.gov.au" : "sample",
    },
  };

  cachedData = result;
  return result;
}

function getSampleData(): ProjectData[] {
  return [
    {
      Portfolio: "Treasury",
      Agency: "Australian Taxation Office",
      Tier: "Tier 1",
      "Project name": "Enterprise Tax System Modernisation",
      "DCA 2024": "Medium",
      "DCA 2025": "Medium-High",
      "DCA 2026": "High",
      "Delivery status": "Active",
      "Total budget (millions)": 850,
      "Digital budget (millions)": 650,
      "Project end date": "2027-06-30",
      "Project description": "Major tax system modernisation project",
    },
    {
      Portfolio: "Home Affairs",
      Agency: "Department of Home Affairs",
      Tier: "Tier 1",
      "Project name": "Border Security Enhancement Program",
      "DCA 2024": "Medium-Low",
      "DCA 2025": "Medium",
      "DCA 2026": "Medium-High",
      "Delivery status": "Active",
      "Total budget (millions)": 1200,
      "Digital budget (millions)": 800,
      "Project end date": "2026-12-31",
      "Project description": "Enhanced border security systems",
    },
    {
      Portfolio: "Health and Aged Care",
      Agency: "Department of Health",
      Tier: "Tier 2",
      "Project name": "National Health Records System",
      "DCA 2024": "Medium",
      "DCA 2025": "Medium",
      "DCA 2026": "Medium",
      "Delivery status": "Active",
      "Total budget (millions)": 450,
      "Digital budget (millions)": 380,
      "Project end date": "2025-12-31",
      "Project description": "Digital health records platform",
    },
    {
      Portfolio: "Defence",
      Agency: "Department of Defence",
      Tier: "Tier 1",
      "Project name": "Defence ICT Transformation",
      "DCA 2024": "Low",
      "DCA 2025": "Medium-Low",
      "DCA 2026": "Medium",
      "Delivery status": "Active",
      "Total budget (millions)": 2500,
      "Digital budget (millions)": 1800,
      "Project end date": "2028-06-30",
      "Project description": "ICT infrastructure modernisation",
    },
    {
      Portfolio: "Services Australia",
      Agency: "Services Australia",
      Tier: "Tier 2",
      "Project name": "Digital Services Platform",
      "DCA 2024": "High",
      "DCA 2025": "High",
      "DCA 2026": "High",
      "Delivery status": "Active",
      "Total budget (millions)": 320,
      "Digital budget (millions)": 280,
      "Project end date": "2025-06-30",
      "Project description": "Citizen services digital platform",
    },
    {
      Portfolio: "Attorney-General's",
      Agency: "Attorney-General's Department",
      Tier: "Tier 3",
      "Project name": "Legal Case Management System",
      "DCA 2024": "Medium-High",
      "DCA 2025": "High",
      "DCA 2026": "High",
      "Delivery status": "Closed",
      "Total budget (millions)": 85,
      "Digital budget (millions)": 70,
      "Project end date": "2024-12-31",
      "Project description": "Legal case tracking and management",
    },
    {
      Portfolio: "Education",
      Agency: "Department of Education",
      Tier: "Tier 2",
      "Project name": "Student Data Analytics Platform",
      "DCA 2024": "Medium-Low",
      "DCA 2025": "Low",
      "DCA 2026": "Medium-Low",
      "Delivery status": "Active",
      "Total budget (millions)": 180,
      "Digital budget (millions)": 150,
      "Project end date": "2026-03-31",
      "Project description": "Education data analytics system",
    },
    {
      Portfolio: "Infrastructure",
      Agency: "Department of Infrastructure",
      Tier: "Tier 3",
      "Project name": "Infrastructure Project Tracking",
      "DCA 2024": "Medium",
      "DCA 2025": "Medium-High",
      "DCA 2026": "Medium-High",
      "Delivery status": "Active",
      "Total budget (millions)": 95,
      "Digital budget (millions)": 75,
      "Project end date": "2025-09-30",
      "Project description": "Project management and tracking system",
    },
  ];
}

export function getUniqueValues(
  projects: ProjectData[],
  field: keyof ProjectData
): string[] {
  const values = new Set<string>();
  projects.forEach((p) => {
    const value = String(p[field] || "").trim();
    if (value) values.add(value);
  });
  return Array.from(values).sort();
}
