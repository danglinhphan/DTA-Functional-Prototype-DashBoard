"use client";

import type { DashboardKPI } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, DollarSign, AlertTriangle, Shield } from "lucide-react";

interface KPIPanelProps {
  data: DashboardKPI;
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: {
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    valueBg: "",
  },
  success: {
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    valueBg: "",
  },
  warning: {
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    valueBg: "",
  },
  danger: {
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    valueBg: "",
  },
};

function KPICard({ title, value, subtitle, icon, variant = "default" }: KPICardProps) {
  const styles = variantStyles[variant];
  
  return (
    <Card className="group border-border/80 bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 pr-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {value}
            </p>
            <p className="text-sm text-muted-foreground/80">{subtitle}</p>
          </div>
          <div className={`rounded-xl p-2.5 ring-1 ring-white/10 ${styles.iconBg} ${styles.iconColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KPIPanel({ data }: KPIPanelProps) {
  const totalDigitalBudget = data.totalDigitalBudget;
  const formattedBudget =
    totalDigitalBudget >= 1000
      ? `$${(totalDigitalBudget / 1000).toFixed(1)}B`
      : `$${totalDigitalBudget.toFixed(0)}M`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <KPICard
        title="Active Projects"
        value={data.activeProjects.toString()}
        subtitle={`of ${data.totalProjects} total projects`}
        icon={<Activity className="h-5 w-5" />}
        variant="default"
      />
      <KPICard
        title="Digital Budget"
        value={formattedBudget}
        subtitle="Total allocated budget"
        icon={<DollarSign className="h-5 w-5" />}
        variant="success"
      />
      <KPICard
        title="High Risk Projects"
        value={data.highRiskProjects.toString()}
        subtitle="DCA Low or Medium-Low"
        icon={<AlertTriangle className="h-5 w-5" />}
        variant="danger"
      />
      <KPICard
        title="Tier 1&2 Healthy"
        value={`${data.healthyPercentage}%`}
        subtitle={`${data.healthyTier12} of ${data.tier12Projects} projects`}
        icon={<Shield className="h-5 w-5" />}
        variant={
          data.healthyPercentage >= 70
            ? "success"
            : data.healthyPercentage >= 50
              ? "warning"
              : "danger"
        }
      />
    </div>
  );
}
