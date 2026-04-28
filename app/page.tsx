"use client";

import { useState, Suspense } from "react";
import { StatsRow } from "@/components/residence/StatsRow";
import { ChartsRow } from "@/components/residence/ChartsRow";
import { ActivityFeed } from "@/components/residence/ActivityFeed";
import { LeadsTable } from "@/components/residence/LeadsTable";
import { AddLeadSheet } from "@/components/residence/AddLeadSheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view") === "leads" ? "leads" : "dashboard";
  const [sheetOpen, setSheetOpen] = useState(false);

  const setView = (v: string) => {
    router.push(`/?view=${v}`);
  };

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">
            {view === "dashboard" ? "Admin · Overview" : "Agent Workspace"}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight mt-1.5">
            {view === "dashboard" ? "Welcome back, Ali" : "My Leads"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {view === "dashboard"
              ? "Here's what's happening across your pipeline today."
              : "Manage your active prospects and follow-ups."}
          </p>
        </div>

        <Tabs value={view} onValueChange={setView}>
          <TabsList className="bg-card border border-border shadow-card p-1 h-11">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-1.5 px-4">
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-1.5 px-4">
              <Users className="h-3.5 w-3.5" /> Leads
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {view === "dashboard" ? (
        <div className="space-y-5">
          <StatsRow />
          <ChartsRow />
          <ActivityFeed />
        </div>
      ) : (
        <LeadsTable onAddLead={() => setSheetOpen(true)} />
      )}
      
      <AddLeadSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

export default function IndexPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-6"><div className="animate-pulse flex flex-col items-center"><div className="h-8 w-32 bg-muted rounded mb-4"></div><div className="h-4 w-48 bg-muted/60 rounded"></div></div></div>}>
      <PageContent />
    </Suspense>
  );
}
