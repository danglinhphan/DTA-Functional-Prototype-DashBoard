"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { DashboardPayload } from "@/types/dashboard";
import { FilterState } from "@/types/project";
import { FilterPanel } from "@/components/dashboard/filter-panel";
import { KPIPanel } from "@/components/dashboard/kpi-panel";
import { DCAByTierChart } from "@/components/dashboard/dca-by-tier-chart";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Database,
  Clock,
  Layers,
  LayoutDashboard,
  SlidersHorizontal,
  BarChart3,
  Table2,
  Info,
  Menu,
  Sun,
  Moon,
} from "lucide-react";

const BudgetByPortfolioChart = dynamic(
  () => import("@/components/dashboard/budget-by-portfolio-chart").then((m) => m.BudgetByPortfolioChart),
  {
    loading: () => (
      <div className="flex h-[230px] items-center justify-center rounded-xl border border-border/70 bg-card/40">
        <Spinner className="h-5 w-5 text-primary" />
      </div>
    ),
  }
);

const DCAComparisonChart = dynamic(
  () => import("@/components/dashboard/dca-comparison-chart").then((m) => m.DCAComparisonChart),
  {
    loading: () => (
      <div className="flex h-[230px] items-center justify-center rounded-xl border border-border/70 bg-card/40">
        <Spinner className="h-5 w-5 text-primary" />
      </div>
    ),
  }
);

const CriticalProjectsTimeline = dynamic(
  () => import("@/components/dashboard/critical-projects-timeline").then((m) => m.CriticalProjectsTimeline),
  {
    loading: () => (
      <div className="flex h-[230px] items-center justify-center rounded-xl border border-border/70 bg-card/40">
        <Spinner className="h-5 w-5 text-primary" />
      </div>
    ),
  }
);

const ProjectTable = dynamic(
  () => import("@/components/dashboard/project-table").then((m) => m.ProjectTable),
  {
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-border/70 bg-card/40">
        <Spinner className="h-5 w-5 text-primary" />
      </div>
    ),
  }
);

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dataResult, setDataResult] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    portfolio: "",
    agency: "",
    tier: "",
    deliveryStatus: "",
    dca2026: "",
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.portfolio) params.set("portfolio", filters.portfolio);
    if (filters.agency) params.set("agency", filters.agency);
    if (filters.tier) params.set("tier", filters.tier);
    if (filters.deliveryStatus) {
      params.set("deliveryStatus", filters.deliveryStatus);
    }
    if (filters.dca2026) params.set("dca2026", filters.dca2026);

    return params.toString();
  }, [filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard${queryString ? `?${queryString}` : ""}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard payload");
      }

      const result = (await response.json()) as DashboardPayload;
      setDataResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center" role="alert" aria-live="assertive">
          <p className="text-destructive text-lg">{error}</p>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "filters", label: "Filters", icon: SlidersHorizontal },
    { id: "charts", label: "Charts & Graphs", icon: BarChart3 },
    { id: "projects", label: "Project Table", icon: Table2 },
    { id: "data-info", label: "Data Info", icon: Info },
  ];

  const metadata = dataResult?.metadata;
  const formattedDate = metadata?.lastUpdated
    ? new Date(metadata.lastUpdated).toLocaleDateString()
    : "N/A";
  const isDark = theme !== "light";

  return (
    <div className="h-screen overflow-hidden bg-background px-2 py-3 sm:px-3 sm:py-4 lg:px-4 lg:py-5">
      <div className="grid h-full w-full gap-3 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-4">
        <aside className="hidden lg:flex lg:h-full lg:flex-col lg:justify-between rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge className="border-0 bg-primary/20 text-primary">
                NAVIGATION
              </Badge>
              <h1 className="text-lg font-semibold text-foreground">DTA Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                One-page operational view for MDPR 2026
              </p>
            </div>
            <nav className="space-y-1.5">
              {navItems.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="space-y-2 rounded-lg border border-border/70 bg-background/40 p-3 text-sm">
            <p className="font-medium text-foreground">Live Summary</p>
            <p className="text-muted-foreground">
              <span className="text-foreground">{metadata?.filteredProjects ?? 0}</span> projects in current view
            </p>
            <p className="text-muted-foreground">
              Source: <span className="text-foreground">{metadata?.source ?? "Unknown"}</span>
            </p>
          </div>
        </aside>

        <main id="main-content" className="space-y-3 overflow-y-auto pr-1">
          <section id="overview" className="rounded-2xl border border-border/70 bg-card/60 p-3 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon-sm" className="lg:hidden" aria-label="Open dashboard navigation">
                        <Menu aria-hidden="true" className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px]">
                      <SheetHeader>
                        <SheetTitle>Dashboard Navigation</SheetTitle>
                        <SheetDescription>Jump to each section in the one-page dashboard.</SheetDescription>
                      </SheetHeader>
                      <nav className="space-y-2 px-4 pb-4">
                        {navItems.map(({ id, label, icon: Icon }) => (
                          <a
                            key={id}
                            href={`#${id}`}
                            className="flex items-center gap-2.5 rounded-md border border-border/70 bg-card/60 px-3 py-2 text-sm text-foreground/90 hover:bg-primary/10"
                          >
                            <Icon aria-hidden="true" className="h-4 w-4" />
                            {label}
                          </a>
                        ))}
                      </nav>
                    </SheetContent>
                  </Sheet>
                  <Badge className="border-0 bg-primary/20 text-primary">
                    Government Portfolio Analytics
                  </Badge>
                  <Badge variant="outline" className="border-border/80 text-foreground/80">
                    2026 Edition
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Major Digital Projects Report - single view monitoring board
                </p>
              </div>
              <div id="data-info" className="flex flex-wrap items-center gap-2 text-sm sm:gap-3 scroll-mt-24">
                <div className="flex items-center gap-1 rounded-md border border-border/70 bg-card/60 p-1">
                  <Button
                    variant={mounted && !isDark ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="h-7 px-2"
                    aria-label="Switch to light mode"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={mounted && isDark ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="h-7 px-2"
                    aria-label="Switch to dark mode"
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </div>
                <span className="flex items-center gap-2 rounded-md border border-border/70 bg-card/70 px-2.5 py-1.5 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span className="text-foreground/90">{metadata?.filteredProjects ?? 0} shown</span>
                </span>
                <span className="flex items-center gap-2 rounded-md border border-border/70 bg-card/70 px-2.5 py-1.5 text-muted-foreground">
                  <Database className="h-4 w-4" />
                  <span className="text-foreground/80">{metadata?.source ?? "Unknown"}</span>
                </span>
                <span className="flex items-center gap-2 rounded-md border border-border/70 bg-card/70 px-2.5 py-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-foreground/80">{formattedDate}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  className="border-border bg-card/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
            <div id="filters" className="scroll-mt-24">
              <FilterPanel
                options={
                  dataResult?.filters || {
                    portfolios: [],
                    agencies: [],
                    tiers: [],
                    statuses: [],
                    dcaLevels: [],
                  }
                }
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </section>

          <section id="charts" className="space-y-3 scroll-mt-24">
            <div className="grid grid-cols-1 gap-3 2xl:grid-cols-[1.1fr_1.9fr]">
              <div>
                <KPIPanel
                  data={
                    dataResult?.kpis || {
                      activeProjects: 0,
                      totalProjects: 0,
                      totalDigitalBudget: 0,
                      highRiskProjects: 0,
                      healthyTier12: 0,
                      tier12Projects: 0,
                      healthyPercentage: 0,
                    }
                  }
                />
              </div>
              <div>
                <DCAByTierChart data={dataResult?.charts.dcaByTier || []} />
              </div>
            </div>

            <Tabs defaultValue="budget" className="rounded-2xl border border-border/70 bg-card/45 p-2">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                <TabsTrigger value="budget" className="border border-border/70 bg-card/70 px-3 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                  Budget by Portfolio
                </TabsTrigger>
                <TabsTrigger value="comparison" className="border border-border/70 bg-card/70 px-3 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                  DCA Comparison
                </TabsTrigger>
                <TabsTrigger value="critical" className="border border-border/70 bg-card/70 px-3 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                  Critical Timeline
                </TabsTrigger>
              </TabsList>
              <TabsContent value="budget" className="mt-2">
                <BudgetByPortfolioChart data={dataResult?.charts.budgetByPortfolio || []} />
              </TabsContent>
              <TabsContent value="comparison" className="mt-2">
                <DCAComparisonChart data={dataResult?.charts.dcaComparison || []} />
              </TabsContent>
              <TabsContent value="critical" className="mt-2">
                <CriticalProjectsTimeline
                  data={dataResult?.charts.criticalTimeline.groups || []}
                  stats={
                    dataResult?.charts.criticalTimeline.stats || {
                      total: 0,
                      overdue: 0,
                      upcoming: 0,
                    }
                  }
                />
              </TabsContent>
            </Tabs>
          </section>

          <section id="projects" className="pb-0.5">
            <ProjectTable data={dataResult?.projects || []} compact />
          </section>
        </main>
      </div>
    </div>
  );
}
