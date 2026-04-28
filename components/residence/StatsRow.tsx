"use client";

import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Users, UserCheck, TrendingUp, Wallet } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta: number;
  trend: number[];
  icon: typeof Users;
  accent: "primary" | "success" | "warning" | "info";
}

const accentMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", stroke: "var(--color-violet-500)" },
  success: { bg: "bg-success/10", text: "text-success", stroke: "var(--color-green-500)" },
  warning: { bg: "bg-warning/10", text: "text-warning", stroke: "var(--color-orange-500)" },
  info:    { bg: "bg-info/10",    text: "text-info",    stroke: "var(--color-blue-500)" },
};

function StatCard({ label, value, delta, trend, icon: Icon, accent }: StatCardProps) {
  const a = accentMap[accent];
  const positive = delta >= 0;
  const data = trend.map((v, i) => ({ i, v }));

  return (
    <Card className="relative overflow-hidden p-5 shadow-card hover:shadow-elevated transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", a.bg)}>
          <Icon className={cn("h-5 w-5", a.text)} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md",
          positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
        )}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {positive ? "+" : ""}{delta}%
        </div>
        <span className="text-[11px] text-muted-foreground">vs last month</span>
      </div>

      {/* Sparkline */}
      <div className="absolute bottom-0 left-0 right-0 h-12 opacity-80 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={a.stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={a.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={a.stroke} strokeWidth={2} fill={`url(#spark-${label})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Leads" value="1,284" delta={12.4}
        trend={[10, 14, 12, 18, 16, 22, 24, 28, 26, 32]}
        icon={Users} accent="primary" />
      <StatCard label="Active Agents" value="38" delta={4.2}
        trend={[20, 22, 21, 24, 25, 27, 26, 28, 30, 32]}
        icon={UserCheck} accent="info" />
      <StatCard label="Conversion Rate" value="24.8%" delta={-2.1}
        trend={[30, 28, 32, 27, 26, 28, 24, 26, 25, 24]}
        icon={TrendingUp} accent="warning" />
      <StatCard label="Revenue Pipeline" value="PKR 1.42 Cr" delta={18.7}
        trend={[12, 18, 16, 22, 28, 26, 32, 36, 38, 44]}
        icon={Wallet} accent="success" />
    </div>
  );
}
