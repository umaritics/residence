import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, UserPlus, MessageSquare, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    who: "Ali Raza", initials: "AR",
    action: "updated lead status to", target: "Closed — DHA Phase 8 Plot",
    time: "2 min ago", icon: CheckCircle2, tone: "success",
  },
  {
    who: "System", initials: "SY",
    action: "assigned a new lead to", target: "Sara Malik",
    time: "18 min ago", icon: UserPlus, tone: "info",
  },
  {
    who: "Sara Malik", initials: "SM",
    action: "logged a call with", target: "Ayesha Khan",
    time: "1 hour ago", icon: MessageSquare, tone: "primary",
  },
  {
    who: "Usman Tariq", initials: "UT",
    action: "uploaded property docs for", target: "Bahria Town Villa",
    time: "3 hours ago", icon: FileText, tone: "warning",
  },
  {
    who: "System", initials: "SY",
    action: "flagged overdue follow-up:", target: "Zain Abbasi",
    time: "Yesterday", icon: AlertCircle, tone: "danger",
  },
];

const toneMap = {
  success: "bg-success-soft text-success",
  info:    "bg-info-soft text-info",
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning-soft text-warning",
  danger:  "bg-danger-soft text-danger",
} as const;

export function ActivityFeed() {
  return (
    <Card className="p-6 shadow-card">
      <CardHeader className="p-0 mb-5 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
          <CardDescription className="text-xs mt-1">Audit trail across all agents</CardDescription>
        </div>
        <button className="text-xs font-semibold text-primary hover:underline">View all</button>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="space-y-1">
          {activities.map((a, i) => {
            const Icon = a.icon;
            return (
              <li
                key={i}
                className="group flex items-start gap-3 rounded-lg px-3 py-3 -mx-3 hover:bg-muted/50 transition"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-[11px] font-semibold">
                    {a.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
                <div className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", toneMap[a.tone as keyof typeof toneMap])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
