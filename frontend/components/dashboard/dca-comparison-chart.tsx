"use client";

import type { DCAComparisonItem } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DCAComparisonChartProps {
  data: DCAComparisonItem[];
}

export function DCAComparisonChart({ data }: DCAComparisonChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            DCA Year-over-Year Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div
            className="flex h-[230px] xl:h-[240px] items-center justify-center text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            No projects with both DCA 2025 and DCA 2026 data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          DCA Year-over-Year Comparison
        </CardTitle>
        <p className="text-sm text-muted-foreground">Confidence assessment changes between 2025 and 2026</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div
          className="h-[230px] xl:h-[240px]"
          role="img"
          aria-label="Grouped bar chart comparing project DCA values between 2025 and 2026"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 70 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--border)" 
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={70}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const labels: Record<number, string> = {
                    1: "Low",
                    2: "M-Low",
                    3: "Med",
                    4: "M-High",
                    5: "High",
                  };
                  return labels[v] || "";
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    const changeText = d.change > 0 ? `+${d.change}` : d.change === 0 ? "No change" : d.change;
                    const changeColor = d.change > 0 ? "text-emerald-400" : d.change < 0 ? "text-red-400" : "text-muted-foreground";
                    return (
                      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                        <p className="font-semibold text-foreground">{d.fullName}</p>
                        <p className="text-sm text-muted-foreground mb-2">{d.agency}</p>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-[#94a3b8]" />
                            <span className="text-muted-foreground">2025:</span>
                            <span className="text-foreground font-medium">{d.dca2025Text}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-[#3b82f6]" />
                            <span className="text-muted-foreground">2026:</span>
                            <span className="text-foreground font-medium">{d.dca2026Text}</span>
                          </p>
                          <p className={`font-medium ${changeColor} pt-1 border-t border-border mt-2`}>
                            Change: {changeText}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: 12,
                  paddingTop: 8,
                  color: "var(--muted-foreground)",
                }}
                formatter={(value) => <span style={{ color: "var(--muted-foreground)" }}>{value}</span>}
                iconType="rect"
                iconSize={12}
              />
              <Bar
                dataKey="DCA 2025"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                name="DCA 2025"
              />
              <Bar
                dataKey="DCA 2026"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="DCA 2026"
              />
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
                  <th className="px-2 py-1">Project</th>
                  <th className="px-2 py-1 text-right">DCA 2025</th>
                  <th className="px-2 py-1 text-right">DCA 2026</th>
                  <th className="px-2 py-1 text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={`${item.fullName}-${item.agency}-${item["DCA 2025"]}-${item["DCA 2026"]}-${index}`}
                    className="border-b border-border/40"
                  >
                    <td className="px-2 py-1 text-foreground">{item.fullName || item.name}</td>
                    <td className="px-2 py-1 text-right text-foreground">{item["DCA 2025"]}</td>
                    <td className="px-2 py-1 text-right text-foreground">{item["DCA 2026"]}</td>
                    <td className="px-2 py-1 text-right text-foreground">{item.change}</td>
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
