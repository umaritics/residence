"use client";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const tooltipStyle = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderRadius: "8px",
  fontSize: "12px",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  color: "#0f172a"
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ChartsRow() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "Admin";

  const { data: leads } = useSWR<any[]>("/api/leads", fetcher, { refreshInterval: 5000 });
  const leadsData = Array.isArray(leads) ? leads : [];

  // Calculate dynamic barData (status counts)
  const statusCounts = { New: 0, Contacted: 0, Negotiating: 0, Closed: 0, Lost: 0 };
  leadsData.forEach((l) => {
    const s = l.status as keyof typeof statusCounts;
    if (statusCounts[s] !== undefined) statusCounts[s]++;
  });

  const dynamicBarData = [
    { status: "New", count: statusCounts.New, fill: "#3b82f6" },       // Blue
    { status: "Contacted", count: statusCounts.Contacted, fill: "#8b5cf6" }, // Violet
    { status: "Negotiating", count: statusCounts.Negotiating, fill: "#f97316" }, // Orange
    { status: "Closed", count: statusCounts.Closed, fill: "#22c55e" },    // Green
    { status: "Lost", count: statusCounts.Lost, fill: "#f43f5e" },        // Red
  ];

  // Calculate dynamic pieData (score counts)
  const scoreCounts = { High: 0, Medium: 0, Low: 0 };
  leadsData.forEach((l) => {
    const sc = l.score as keyof typeof scoreCounts;
    if (scoreCounts[sc] !== undefined) scoreCounts[sc]++;
  });

  // FIX: Added explicit hex colors for the Pie Chart
  const dynamicPieData = [
    { name: "High", value: scoreCounts.High, color: "#22c55e" },   // Green
    { name: "Medium", value: scoreCounts.Medium, color: "#f97316" }, // Orange
    { name: "Low", value: scoreCounts.Low, color: "#f43f5e" },     // Red
  ];

  // Calculate Agent Performance
  const agentCounts: Record<string, number> = {};
  leadsData.forEach((l) => {
    const agentName = l.assignedTo?.name || "Unassigned";
    agentCounts[agentName] = (agentCounts[agentName] || 0) + 1;
  });

  const dynamicAgentData = Object.keys(agentCounts)
    .map(name => ({ name, leads: agentCounts[name] }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5); // top 5 agents

  return (
    <div className={cn("grid grid-cols-1 gap-6 mb-6", isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-3")}>
      <Card className={cn("shadow-card flex flex-col", isAdmin ? "lg:col-span-1" : "lg:col-span-2")}>
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Lead Funnel</CardTitle>
              <CardDescription className="text-xs mt-1">Current distribution of leads by status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={dynamicBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              {/* FIX: Changed cursor fill to a soft transparent gray instead of black */}
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                 {dynamicBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-card flex flex-col">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="font-display text-lg">Priority Split</CardTitle>
          <CardDescription className="text-xs mt-1">Priority breakdown across all leads</CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie
                data={dynamicPieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {dynamicPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="shadow-card flex flex-col">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="font-display text-lg">Agent Performance</CardTitle>
            <CardDescription className="text-xs mt-1">Top 5 agents by assigned leads</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={dynamicAgentData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                {/* FIX: Soft cursor and explicit fill color for the horizontal bars */}
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="leads" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}