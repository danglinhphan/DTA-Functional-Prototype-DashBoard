import { describe, expect, it } from "vitest";

import {
  getDashboardPayload,
  parseFiltersFromSearchParams,
} from "./dashboard-data";

describe("parseFiltersFromSearchParams", () => {
  it("returns empty filters when params are missing", () => {
    const params = new URLSearchParams();
    const result = parseFiltersFromSearchParams(params);

    expect(result).toEqual({
      portfolio: "",
      agency: "",
      tier: "",
      deliveryStatus: "",
      dca2026: "",
    });
  });

  it("maps known query params to filter state", () => {
    const params = new URLSearchParams({
      portfolio: "Treasury",
      agency: "ATO",
      tier: "Tier 1",
      deliveryStatus: "Active",
      dca2026: "High",
      ignored: "value",
    });

    const result = parseFiltersFromSearchParams(params);

    expect(result).toEqual({
      portfolio: "Treasury",
      agency: "ATO",
      tier: "Tier 1",
      deliveryStatus: "Active",
      dca2026: "High",
    });
  });
});

describe("getDashboardPayload", () => {
  it("returns structurally valid payload with metadata and charts", async () => {
    const payload = await getDashboardPayload({});

    expect(payload.metadata.totalProjects).toBeGreaterThan(0);
    expect(payload.metadata.filteredProjects).toBeGreaterThan(0);
    expect(payload.metadata.filteredProjects).toBeLessThanOrEqual(payload.metadata.totalProjects);

    expect(payload.filters.portfolios.length).toBeGreaterThan(0);
    expect(payload.kpis.totalProjects).toBe(payload.metadata.filteredProjects);

    expect(Array.isArray(payload.charts.dcaByTier)).toBe(true);
    expect(Array.isArray(payload.charts.budgetByPortfolio)).toBe(true);
    expect(Array.isArray(payload.charts.dcaComparison)).toBe(true);
    expect(Array.isArray(payload.projects)).toBe(true);
  });

  it("applies filters and narrows returned projects", async () => {
    const unfiltered = await getDashboardPayload({});
    const selectedPortfolio = unfiltered.projects[0]?.Portfolio || "";

    const filtered = await getDashboardPayload({ portfolio: selectedPortfolio });

    expect(filtered.metadata.filteredProjects).toBeLessThanOrEqual(
      unfiltered.metadata.filteredProjects
    );

    for (const project of filtered.projects) {
      expect(project.Portfolio).toBe(selectedPortfolio);
    }
  });
});
