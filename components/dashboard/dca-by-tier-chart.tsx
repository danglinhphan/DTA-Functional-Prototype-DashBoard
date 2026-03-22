"use client";

import type { DCAByTierItem } from "@/types/dashboard";
import { DCA_LEVELS, DCA_COLORS } from "@/types/project";
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

interface DCAByTierChartProps {
  data: DCAByTierItem[];
}

export function DCAByTierChart({ data }: DCAByTierChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          DCA Confidence Level by Tier
        </CardTitle>
        <p className="text-sm text-muted-foreground">Distribution of delivery confidence across project tiers</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div
          className="h-[250px] xl:h-[260px]"
          role="img"
          aria-label="Stacked bar chart showing DCA confidence distribution by project tier"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--border)" 
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)", fontSize: 13, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis 
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <div className="mt-2 space-y-1.5 text-xs">
                        {payload.map((entry) => (
                          <p key={entry.dataKey} className="flex items-center justify-between gap-4 text-muted-foreground">
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.dataKey}</span>
                            </span>
                            <span className="font-semibold text-foreground">{Number(entry.value || 0)}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: 12,
                  paddingTop: 16,
                  color: "var(--muted-foreground)",
                }}
                formatter={(value) => <span style={{ color: "var(--muted-foreground)" }}>{value}</span>}
                iconType="circle"
                iconSize={10}
              />
              {DCA_LEVELS.map((level) => (
                <Bar
                  key={level}
                  dataKey={level}
                  stackId="a"
                  fill={DCA_COLORS[level]}
                  radius={level === "High" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
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
                  <th className="px-2 py-1">Tier</th>
                  {DCA_LEVELS.map((level) => (
                    <th key={level} className="px-2 py-1">{level}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.name} className="border-b border-border/40">
                    <td className="px-2 py-1 text-foreground">{item.name}</td>
                    {DCA_LEVELS.map((level) => (
                      <td key={`${item.name}-${level}`} className="px-2 py-1 text-foreground">
                        {item[level] ?? 0}
                      </td>
                    ))}
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
