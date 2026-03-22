"use client";

import { useState, useMemo } from "react";
import { ProjectData } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface ProjectTableProps {
  data: ProjectData[];
  compact?: boolean;
}

type SortField =
  | "Project name"
  | "Agency"
  | "Tier"
  | "DCA 2026"
  | "Delivery status"
  | "Digital budget (millions)"
  | "Project end date";

type SortDirection = "asc" | "desc";

const DCA_ORDER: Record<string, number> = {
  High: 5,
  "Medium-High": 4,
  Medium: 3,
  "Medium-Low": 2,
  Low: 1,
};

// Semantic colors for DCA badges
const DCA_BADGE_STYLES: Record<string, string> = {
  High: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Medium-High": "bg-green-500/20 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Medium-Low": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Low: "bg-red-500/20 text-red-400 border-red-500/30",
};

const SORT_LABELS: Record<SortField, string> = {
  "Project name": "Project Name",
  Agency: "Agency",
  Tier: "Tier",
  "DCA 2026": "DCA 2026",
  "Delivery status": "Status",
  "Digital budget (millions)": "Budget",
  "Project end date": "End Date",
};

export function ProjectTable({ data, compact = false }: ProjectTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("Project name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const pageSize = compact ? 5 : 10;

  const filteredAndSorted = useMemo(() => {
    let result = [...data];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p["Project name"]?.toLowerCase().includes(searchLower) ||
          p.Agency?.toLowerCase().includes(searchLower) ||
          p.Portfolio?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortField === "DCA 2026") {
        aVal = DCA_ORDER[a["DCA 2026"]] || 0;
        bVal = DCA_ORDER[b["DCA 2026"]] || 0;
      } else if (sortField === "Digital budget (millions)") {
        aVal = a["Digital budget (millions)"] || 0;
        bVal = b["Digital budget (millions)"] || 0;
      } else {
        aVal = String(a[sortField] || "").toLowerCase();
        bVal = String(b[sortField] || "").toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paginatedData = filteredAndSorted.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const renderSortButton = (field: SortField) => {
    const isActive = sortField === field;
    const directionText = isActive
      ? sortDirection === "asc"
        ? "ascending"
        : "descending"
      : "not sorted";

    const icon = !isActive ? (
      <ArrowUpDown aria-hidden="true" className="ml-1.5 h-3.5 w-3.5 opacity-40" />
    ) : sortDirection === "asc" ? (
      <ArrowUp aria-hidden="true" className="ml-1.5 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown aria-hidden="true" className="ml-1.5 h-3.5 w-3.5 text-primary" />
    );

    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className="group inline-flex items-center rounded-sm text-foreground font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={`Sort by ${SORT_LABELS[field]}. Current state: ${directionText}.`}
      >
        {SORT_LABELS[field]}
        {icon}
      </button>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className={compact ? "pb-3" : "pb-4"}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Project Details
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredAndSorted.length} projects total
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <label htmlFor="project-search" className="sr-only">
              Search projects by name, agency, or portfolio
            </label>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="project-search"
              aria-label="Search projects"
              placeholder="Search projects, agencies, portfolios..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 bg-secondary/50 border-border focus:border-primary"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className={`overflow-x-auto ${compact ? "max-h-[280px] overflow-y-auto" : ""}`}>
            <Table>
              <TableHeader className="sticky top-0 z-20">
                <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-b border-border">
                  <TableHead aria-sort={sortField === "Project name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
                    {renderSortButton("Project name")}
                  </TableHead>
                  <TableHead aria-sort={sortField === "Agency" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
                    {renderSortButton("Agency")}
                  </TableHead>
                  <TableHead aria-sort={sortField === "Tier" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
                    {renderSortButton("Tier")}
                  </TableHead>
                  <TableHead aria-sort={sortField === "DCA 2026" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
                    {renderSortButton("DCA 2026")}
                  </TableHead>
                  <TableHead aria-sort={sortField === "Delivery status" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
                    {renderSortButton("Delivery status")}
                  </TableHead>
                  <TableHead className="text-right" aria-sort={sortField === "Digital budget (millions)" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
                    <div className="flex justify-end">
                      {renderSortButton("Digital budget (millions)")}
                    </div>
                  </TableHead>
                  <TableHead aria-sort={sortField === "Project end date" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
                    {renderSortButton("Project end date")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 opacity-40" />
                        <p>No projects found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((project, idx) => (
                    <TableRow 
                      key={`${project["Project name"]}-${project.Agency}-${project["Project end date"] || "na"}-${idx}`} 
                      className="hover:bg-secondary/30 border-b border-border/50 transition-colors"
                    >
                      <TableCell className="font-medium max-w-[220px] text-foreground">
                        <span className="line-clamp-2">
                          {project["Project name"]}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[160px] text-foreground/90">
                        <span className="line-clamp-1">{project.Agency}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="whitespace-nowrap bg-secondary/50 text-foreground border-border"
                        >
                          {project.Tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`whitespace-nowrap ${DCA_BADGE_STYLES[project["DCA 2026"]] || "bg-secondary/50 text-foreground"}`}
                        >
                          {project["DCA 2026"] || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`whitespace-nowrap ${
                            project["Delivery status"] === "Active"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-secondary/50 text-muted-foreground border-border"
                          }`}
                        >
                          {project["Delivery status"]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        ${project["Digital budget (millions)"]?.toFixed(1)}M
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-foreground/90">
                        {project["Project end date"] || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="text-foreground font-medium">{Math.min(page * pageSize, filteredAndSorted.length)}</span> of{" "}
            <span className="text-foreground font-medium">{filteredAndSorted.length}</span> projects
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              <span className="text-foreground font-medium">{page}</span>
              <span className="text-muted-foreground"> / {totalPages || 1}</span>
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
