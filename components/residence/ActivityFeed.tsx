"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, UserPlus, MessageSquare, FileText, AlertCircle, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const toneMap = {
  success: "bg-success-soft text-success",
  info:    "bg-info-soft text-info",
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning-soft text-warning",
  danger:  "bg-danger-soft text-danger",
} as const;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ActivityFeed() {
  const { data: activities, error } = useSWR<any[]>("/api/activity", fetcher, {
    refreshInterval: 5000,
  });

  const logs = Array.isArray(activities) ? activities : [];
  const isLoading = !activities && !error;

  return (
    <Card className="p-6 shadow-card border-border/50">
      <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-display text-xl">Global Audit Trail</CardTitle>
          <CardDescription className="text-sm mt-1">Real-time chronologic log of all CRM events.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="h-4 w-48 bg-muted rounded"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
            No recent activity found in the system.
          </p>
        ) : (
          <ul className="space-y-2">
            {logs.map((a) => {
              // Parse data safely
              const who = a.userId?.name || "System";
              const initials = who.substring(0, 2).toUpperCase();
              const action = a.action || "performed an action";
              const target = a.leadId ? `${a.leadId.name}` : "";
              const time = new Date(a.timestamp).toLocaleString("en-GB", { 
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" 
              });
              
              // Dynamic Icon & Color mapping based on backend action string
              let tone: keyof typeof toneMap = "primary";
              let Icon = MessageSquare;
              
              if (action.includes("created")) { tone = "success"; Icon = UserPlus; }
              else if (action.includes("updated")) { tone = "info"; Icon = FileText; }
              else if (action.includes("reassigned")) { tone = "warning"; Icon = CheckCircle2; }
              else if (action.includes("deleted")) { tone = "danger"; Icon = Trash; }

              return (
                <li
                  key={a._id}
                  className="group flex items-start gap-4 rounded-xl p-3 border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-300"
                >
                  <Avatar className="h-10 w-10 shadow-sm border border-border/50">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-700 text-white text-xs font-bold tracking-wider">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm leading-relaxed text-foreground/90">
                      <span className="font-bold text-foreground">{who}</span>{" "}
                      <span className="text-muted-foreground">{action}</span>{" "}
                      {target && <span className="font-semibold text-primary/90">{target}</span>}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-1 tracking-wide uppercase">
                      {time}
                    </p>
                  </div>
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm", toneMap[tone])}>
                    <Icon className="h-4 w-4" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}