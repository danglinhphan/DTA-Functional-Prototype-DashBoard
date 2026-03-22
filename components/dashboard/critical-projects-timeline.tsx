"use client";

import type {
  CriticalTimelineGroup,
  CriticalTimelineStats,
} from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, DollarSign, Clock } from "lucide-react";

interface CriticalProjectsTimelineProps {
  data: CriticalTimelineGroup[];
  stats: CriticalTimelineStats;
}

export function CriticalProjectsTimeline({ data, stats }: CriticalProjectsTimelineProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            Critical Projects Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div
            className="flex h-[230px] xl:h-[240px] items-center justify-center text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <Clock aria-hidden="true" className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No critical projects (DCA Low/Medium-Low) found</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Critical Projects Timeline
            </CardTitle>
            <p className="text-sm text-muted-foreground">Projects requiring attention (DCA Low/Medium-Low)</p>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-foreground font-medium">{stats.overdue}</span>
              <span className="text-muted-foreground">Overdue</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-foreground font-medium">{stats.upcoming}</span>
              <span className="text-muted-foreground">Due soon</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div
          className="max-h-[230px] xl:max-h-[240px] overflow-y-auto pr-2 space-y-4"
          role="region"
          aria-label="Critical projects grouped by quarter"
        >
          {data.map((group) => (
            <div key={group.quarter} className="relative">
              <div className="sticky top-0 z-10 mb-3 bg-card pb-1">
                <Badge 
                  variant="outline" 
                  className="text-xs font-semibold bg-secondary/50 border-border text-foreground"
                >
                  {group.quarter}
                </Badge>
              </div>
              <div className="ml-3 border-l-2 border-border pl-5 space-y-3">
                {group.projects.map((project, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border p-4 transition-colors ${
                        project.isOverdue
                          ? "border-red-500/40 bg-red-500/10 hover:border-red-500/60"
                          : "border-border bg-secondary/30 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground leading-tight">
                            {project.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {project.portfolio}
                          </p>
                        </div>
                        <Badge
                          className={`shrink-0 ${
                            project.dca === "Low" 
                              ? "bg-red-500/20 text-red-400 border-red-500/30" 
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}
                          variant="outline"
                        >
                          {project.dca}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-foreground">{project.dateStr}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span className="text-foreground">${project.budget}M</span>
                        </span>
                        {project.isOverdue && (
                          <span className="flex items-center gap-1.5 text-red-400 font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
