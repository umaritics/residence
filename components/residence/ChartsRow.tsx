"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const barData = [
  { status: "New", count: 342, fill: "var(--color-blue-500)" },
  { status: "Contacted", count: 218, fill: "var(--color-violet-500)" },
  { status: "Negotiating", count: 156, fill: "var(--color-orange-500)" },
  { status: "Closed", count: 92, fill: "var(--color-green-500)" },
  { status: "Lost", count: 64, fill: "var(--color-rose-500)" },
];

const pieData = [
  { name: "High", value: 412, fill: "var(--color-green-500)" },
  { name: "Medium", value: 538, fill: "var(--color-orange-500)" },
  { name: "Low", value: 334, fill: "var(--color-rose-500)" },
];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "var(--shadow-elevated)",
} as const;

export function ChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Bar */}
      <Card className="lg:col-span-2 p-6 shadow-card">
        <CardHeader className="p-0 mb-6 flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="font-display text-lg">Leads by Status</CardTitle>
            <CardDescription className="text-xs mt-1">Distribution across the active pipeline</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" /> Last 30 days
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Doughnut */}
      <Card className="p-6 shadow-card">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="font-display text-lg">Leads by Priority</CardTitle>
          <CardDescription className="text-xs mt-1">Priority breakdown across all leads</CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie
                data={pieData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} stroke="none"
              >
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Legend
                verticalAlign="bottom" iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
