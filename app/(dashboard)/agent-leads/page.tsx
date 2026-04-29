"use client";

import { useState } from "react";
import { LeadsTable } from "@/components/residence/LeadsTable";
import { AddLeadSheet } from "@/components/residence/AddLeadSheet";

export default function AgentLeadsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="px-6 py-6 max-w-[1500px] mx-auto animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">
            Agent Workspace
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight mt-1.5">
            My Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your active prospects and follow-ups.
          </p>
        </div>
      </div>

      {/* Content */}
      <LeadsTable onAddLead={() => setSheetOpen(true)} />
      
      <AddLeadSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
