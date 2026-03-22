"use client";

import { FilterState } from "@/types/project";
import type { FilterOptions } from "@/types/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface FilterPanelProps {
  options: FilterOptions;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterPanel({ options, filters, onFiltersChange }: FilterPanelProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      portfolio: "",
      agency: "",
      tier: "",
      deliveryStatus: "",
      dca2026: "",
    });
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== "").length;

  return (
    <div className="rounded-lg border border-border/70 bg-card/70 p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-foreground h-8"
            >
              <X aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Showing projects that match all active filters.
        </p>
        
        <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <legend className="sr-only">Dashboard filter options</legend>
          <Select
            value={filters.portfolio || "all"}
            onValueChange={(v) => updateFilter("portfolio", v === "all" ? "" : v)}
          >
            <label htmlFor="filter-portfolio" className="sr-only">Filter by portfolio</label>
            <SelectTrigger 
              id="filter-portfolio"
              aria-label="Filter by portfolio"
              className={`w-full border-border transition-colors ${
                filters.portfolio ? "bg-primary/10 border-primary/40 text-foreground" : "bg-secondary/50"
              }`}
            >
              <SelectValue placeholder="All Portfolios" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Portfolios</SelectItem>
              {options.portfolios.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.agency || "all"}
            onValueChange={(v) => updateFilter("agency", v === "all" ? "" : v)}
          >
            <label htmlFor="filter-agency" className="sr-only">Filter by agency</label>
            <SelectTrigger 
              id="filter-agency"
              aria-label="Filter by agency"
              className={`w-full border-border transition-colors ${
                filters.agency ? "bg-primary/10 border-primary/40 text-foreground" : "bg-secondary/50"
              }`}
            >
              <SelectValue placeholder="All Agencies" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Agencies</SelectItem>
              {options.agencies.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.tier || "all"}
            onValueChange={(v) => updateFilter("tier", v === "all" ? "" : v)}
          >
            <label htmlFor="filter-tier" className="sr-only">Filter by tier</label>
            <SelectTrigger 
              id="filter-tier"
              aria-label="Filter by tier"
              className={`w-full border-border transition-colors ${
                filters.tier ? "bg-primary/10 border-primary/40 text-foreground" : "bg-secondary/50"
              }`}
            >
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {options.tiers.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.deliveryStatus || "all"}
            onValueChange={(v) => updateFilter("deliveryStatus", v === "all" ? "" : v)}
          >
            <label htmlFor="filter-status" className="sr-only">Filter by delivery status</label>
            <SelectTrigger 
              id="filter-status"
              aria-label="Filter by delivery status"
              className={`w-full border-border transition-colors ${
                filters.deliveryStatus ? "bg-primary/10 border-primary/40 text-foreground" : "bg-secondary/50"
              }`}
            >
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {options.statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.dca2026 || "all"}
            onValueChange={(v) => updateFilter("dca2026", v === "all" ? "" : v)}
          >
            <label htmlFor="filter-dca-2026" className="sr-only">Filter by DCA 2026 level</label>
            <SelectTrigger 
              id="filter-dca-2026"
              aria-label="Filter by DCA 2026 level"
              className={`w-full border-border transition-colors ${
                filters.dca2026 ? "bg-primary/10 border-primary/40 text-foreground" : "bg-secondary/50"
              }`}
            >
              <SelectValue placeholder="All DCA 2026" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All DCA 2026</SelectItem>
              {options.dcaLevels.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>
      </div>
    </div>
  );
}
