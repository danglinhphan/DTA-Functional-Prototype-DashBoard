"use client";

import type { BudgetByPortfolioItem } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface BudgetByPortfolioChartProps {
  data: BudgetByPortfolioItem[];
}

// Colorblind-friendly palette with good contrast on dark backgrounds
const COLORS = [
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#a855f7", // Purple
  "#84cc16", // Lime
];

export function BudgetByPortfolioChart({ data }: BudgetByPortfolioChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Budget Allocation by Portfolio
        </CardTitle>
        <p className="text-sm text-muted-foreground">Top 10 portfolios by digital budget (millions AUD)</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div
          className="h-[230px] xl:h-[240px]"
          role="img"
          aria-label="Horizontal bar chart showing top ten portfolios by digital budget in millions of AUD"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 4, left: 12, bottom: 8 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--border)" 
                strokeOpacity={0.5}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(v) => `$${v}M`}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                dataKey={(entry: BudgetByPortfolioItem) => entry.fullName || entry.name}
                type="category"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                width={320}
                interval={0}
                tickMargin={8}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const item = payload[0]?.payload as BudgetByPortfolioItem;
                  const value = Number(payload[0]?.value || 0);

                  return (
                    <div className="max-w-[280px] rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="text-sm font-semibold text-foreground">
                        {item?.fullName || label}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Digital Budget: <span className="font-medium text-foreground">${value.toLocaleString()}M</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <details className="mt-3 rounded-md border border-border/70 bg-background/40 p-2 text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            View chart data as table
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="px-2 py-1">Portfolio</th>
                  <th className="px-2 py-1 text-right">Budget (M AUD)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.fullName || item.name} className="border-b border-border/40">
                    <td className="px-2 py-1 text-foreground">{item.fullName || item.name}</td>
                    <td className="px-2 py-1 text-right text-foreground">{item.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
