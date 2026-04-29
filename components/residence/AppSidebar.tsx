"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  ChevronLeft,
  Building2,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const items: { key: string; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "Admin" },
  { key: "leads", label: "My Leads", icon: Users, badge: "Agent" },
  { key: "activity", label: "Activity Log", icon: Activity },
  { key: "settings", label: "Settings", icon: Settings },
];

function SidebarContent() {
  const [collapsed, setCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "Admin";
  
  const active = searchParams.get("view") === "leads" ? "leads" : "dashboard";

  const onNavigate = (key: string) => {
    if (key === "leads" && !isAdmin) {
      router.push(`/agent-leads`);
    } else {
      router.push(`/?view=${key}`);
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-out",
        collapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-glow">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-bold text-sm text-white tracking-tight leading-none">
              MSM Technologies
            </p>
            <p className="text-[11px] text-violet-300/80 mt-1">
              CRM Portal
            </p>
          </div>
        )}
              </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-violet-300/50">
            Workspace
          </p>
        )}
        {items.map((item) => {
          // Hide admin links from agents
          if (!isAdmin && (item.key === "dashboard" || item.key === "settings" || item.key === "activity")) {
            return null;
          }

          const Icon = item.icon;
          const isActive = !isAdmin && item.key === "leads" ? true : item.key === active;
          const clickable = item.key === "dashboard" || item.key === "leads" || item.key === "activity";
          return (
            <button
              key={item.key}
              onClick={() => clickable && onNavigate(item.key)}
              className={cn(
                "group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-violet-600/20 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-violet-400" : "text-violet-400/60 group-hover:text-violet-300")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-200 group-hover:text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer card */}
      {!collapsed && (
        <div className="p-3">
          <div className="rounded-xl bg-violet-600/20 border border-violet-500/20 p-4">
            <LifeBuoy className="h-5 w-5 text-violet-400 mb-2" />
            <p className="text-xs font-semibold text-white">Need help?</p>
            <p className="text-[11px] text-violet-200/70 mt-1 leading-relaxed">
              Reach out to support for onboarding & training.
            </p>
            <button className="mt-3 w-full text-xs font-medium bg-violet-500 hover:bg-violet-600 text-white transition rounded-md py-1.5">
              Contact support
            </button>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border border-border shadow-card flex items-center justify-center hover:bg-muted transition"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </aside>
  );
}

export function AppSidebar() {
  return (
    <Suspense fallback={<div className="w-[76px] md:w-[260px] bg-sidebar border-r border-sidebar-border h-screen flex-shrink-0" />}>
      <SidebarContent />
    </Suspense>
  );
}
