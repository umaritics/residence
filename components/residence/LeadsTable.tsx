"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  Search, Plus, Filter, MoreHorizontal, Mail, Phone, AlertCircle, Edit, Trash, Download, History, Clock 
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EditLeadSheet } from "./EditLeadSheet";
import useSWR from "swr";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const priorityStyle: Record<string, string> = {
  high: "bg-success-soft text-success border-success/20",
  medium: "bg-warning-soft text-warning border-warning/20",
  low: "bg-danger-soft text-danger border-danger/20",
};

const statusStyle: Record<string, string> = {
  new: "text-info",
  contacted: "text-primary",
  negotiating: "text-warning",
  closed: "text-success",
  lost: "text-danger",
};

export function formatPKR(n: number) {
  if (n >= 10_000_000) return `PKR ${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)} M`;
  return `PKR ${n.toLocaleString()}`;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Props {
  onAddLead: () => void;
}

export function LeadsTable({ onAddLead }: Props) {
  // Filters State
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Interaction State
  const [editingLead, setEditingLead] = useState<any>(null);
  const [timelineLead, setTimelineLead] = useState<any>(null);

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "Admin";

  // Data Fetching
  const { data: leads, error, mutate } = useSWR<any[]>("/api/leads", fetcher, { refreshInterval: 5000 });
  const { data: agents } = useSWR<any[]>(isAdmin ? "/api/users" : null, fetcher);
  const { data: activities } = useSWR<any[]>("/api/activity", fetcher, { refreshInterval: 5000 });

  const isLoading = !leads && !error;
  const leadsData = Array.isArray(leads) ? leads : [];
  const activitiesData = Array.isArray(activities) ? activities : [];

  // Filter Logic
  const filtered = leadsData.filter((l) => {
    const matchesQ = !query || l.name.toLowerCase().includes(query.toLowerCase()) || l.propertyInterest?.toLowerCase().includes(query.toLowerCase());
    const matchesS = statusFilter === "all" || l.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesP = priorityFilter === "all" || l.score?.toLowerCase() === priorityFilter.toLowerCase();
    
    let matchesD = true;
    if (dateFilter !== "all" && l.createdAt) {
      const created = new Date(l.createdAt);
      const now = new Date();
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
      if (dateFilter === "today") matchesD = diffDays < 1;
      else if (dateFilter === "week") matchesD = diffDays <= 7;
      else if (dateFilter === "month") matchesD = diffDays <= 30;
    }
    return matchesQ && matchesS && matchesP && matchesD;
  });

  // Timeline Data for the active modal
  const timelineActivities = activitiesData.filter(a => 
    a.leadId?._id === timelineLead?._id || a.leadId === timelineLead?._id
  );

  // Export to CSV Feature
  const exportCSV = () => {
    const headers = ["ID", "Name", "Phone", "Email", "Property", "Budget", "Priority", "Status", "Next Follow-up", "Assigned To"];
    const rows = filtered.map(l => [
      l._id, `"${l.name}"`, `"${l.phone}"`, `"${l.email || ""}"`, `"${l.propertyInterest}"`, 
      l.budget, l.score || "", l.status, l.nextFollowUp ? new Date(l.nextFollowUp).toLocaleString() : "", `"${l.assignedTo?.name || "Unassigned"}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MSM_Leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export successful", { description: "Your leads have been downloaded as a CSV." });
  };

  // API Call Handlers
  const updateStatus = async (id: string, s: string) => {
    try {
      mutate(leadsData.map((l) => (l._id === id ? { ...l, status: s } : l)), false);
      const res = await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) });
      if (!res.ok) throw new Error("Failed to update status");
      mutate();
    } catch (err) { toast.error("Failed to update status"); mutate(); }
  };

  const updateAssignment = async (id: string, agentId: string) => {
    try {
      const selectedAgent = agents?.find(a => a._id === agentId);
      mutate(leadsData.map((l) => (l._id === id ? { ...l, assignedTo: { _id: agentId, name: selectedAgent?.name || "Agent" } } : l)), false);
      const res = await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignedTo: agentId }) });
      if (!res.ok) throw new Error("Failed to reassign lead");
      mutate();
      toast.success("Lead reassigned", { description: `Assigned to ${selectedAgent?.name}` });
    } catch (err) { toast.error("Failed to reassign lead"); mutate(); }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete lead");
      mutate(); 
      toast.success("Lead deleted successfully");
    } catch (err) { toast.error("Failed to delete lead"); }
  };

  return (
    <Card className="shadow-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-3 p-5 border-b border-border">
        <div className="shrink-0">
          <h2 className="font-display text-lg font-semibold">Active Leads</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} matching records</p>
        </div>
        <div className="flex-1 flex flex-wrap items-center gap-2 xl:justify-end">
          <div className="relative w-full sm:w-auto sm:min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search names, properties…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 h-9 bg-muted/40 border-transparent" />
          </div>
          
          {/* New Multi-Filters */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[130px] h-9 bg-muted/40 border-transparent"><Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[130px] h-9 bg-muted/40 border-transparent"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[130px] h-9 bg-muted/40 border-transparent"><SelectValue placeholder="Date" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Created Today</SelectItem>
              <SelectItem value="week">Past 7 Days</SelectItem>
              <SelectItem value="month">Past 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" onClick={exportCSV} className="h-9 w-full sm:w-auto bg-background"><Download className="h-4 w-4 mr-2" /> Export</Button>
            <Button onClick={onAddLead} className="h-9 w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-glow"><Plus className="h-4 w-4 mr-1.5" /> Add Lead</Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-border">
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Lead Details</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Contact</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Property & Budget</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Priority</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Follow-up</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10">Loading leads...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10">No leads match your filters.</TableCell></TableRow>
            ) : filtered.map((lead) => {
              
              // STALE LEAD DETECTION: No update in 7 days
              const lastUpdate = lead.updatedAt || lead.createdAt || Date.now();
              const isStale = lead.status !== "Closed" && lead.status !== "Lost" && (new Date().getTime() - new Date(lastUpdate).getTime() > 7 * 24 * 60 * 60 * 1000);

              return (
              <TableRow key={lead._id} className="hover:bg-muted/30 transition border-border">
                <TableCell className="py-4 align-top">
                  <div className="font-semibold text-sm flex items-center">
                    {lead.name}
                    {isStale && (
                      <Badge variant="outline" className="ml-2 bg-warning/10 text-warning border-warning/20 text-[9px] px-1.5 py-0" title="No activity in 7+ days">
                        Stale
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {lead._id.substring(0, 8)} {!isAdmin && ` · ${lead.assignedTo?.name || "Unassigned"}`}
                  </div>
                  {isAdmin && (
                    <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                      <Select value={lead.assignedTo?._id || ""} onValueChange={(v) => updateAssignment(lead._id, v)}>
                        <SelectTrigger className="h-6 w-[130px] text-[10px] bg-muted/50 border-transparent"><SelectValue placeholder="Assign agent" /></SelectTrigger>
                        <SelectContent>
                          {agents?.map(a => <SelectItem key={a._id} value={a._id} className="text-xs">{a.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {lead.email || "No email"}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                    <Phone className="h-3 w-3" /> {lead.phone}
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-success/15 text-success hover:bg-success/30 transition-colors" title="Chat on WhatsApp">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l.6.952-1.001 3.648 3.74-.98z"/></svg>
                    </a>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm font-medium">{lead.propertyInterest}</div>
                  <div className="font-display font-semibold text-xs tabular-nums text-muted-foreground mt-0.5">{formatPKR(lead.budget)}</div>
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant="outline" className={cn("font-semibold capitalize", lead.score ? priorityStyle[lead.score.toLowerCase()] : "")}>
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />{lead.score || "Unscored"}
                  </Badge>
                </TableCell>
                <TableCell className="align-top">
                  <Select value={lead.status} onValueChange={(v) => updateStatus(lead._id, v)}>
                    <SelectTrigger className={cn("h-8 w-[130px] rounded-full border-border bg-transparent text-xs font-semibold capitalize", statusStyle[lead.status?.toLowerCase()] || "text-foreground")}>
                      <SelectValue placeholder={lead.status || "Set Status"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Negotiating">Negotiating</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap align-top pt-5">
                  {lead.nextFollowUp ? (() => {
                    const date = new Date(lead.nextFollowUp);
                    const isOverdue = date < new Date();
                    return (
                      <span className={cn("font-medium", isOverdue ? "text-danger" : "text-muted-foreground")}>
                        {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {isOverdue && <AlertCircle className="inline ml-1.5 h-3.5 w-3.5" />}
                      </span>
                    );
                  })() : <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {/* NEW TIMELINE BUTTON */}
                      <DropdownMenuItem onClick={() => setTimelineLead(lead)} className="cursor-pointer">
                        <History className="h-4 w-4 mr-2 text-primary" /> View History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingLead(lead)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2 text-muted-foreground" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteLead(lead._id)} className="cursor-pointer text-danger focus:text-danger focus:bg-danger/10">
                        <Trash className="h-4 w-4 mr-2" /> Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>

      <EditLeadSheet lead={editingLead} open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)} />

      {/* LEAD TIMELINE MODAL */}
      <Dialog open={!!timelineLead} onOpenChange={(open) => !open && setTimelineLead(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lead Timeline</DialogTitle>
            <DialogDescription>
              Audit trail for <span className="font-semibold text-foreground">{timelineLead?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto pr-4 scrollbar-thin mt-2">
            {timelineActivities.length === 0 ? (
              <p className="text-sm text-center py-6 text-muted-foreground">No history found for this lead.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {timelineActivities.map((log) => (
                  <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border bg-muted/20 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{log.userId?.name || "System"}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center"><Clock className="h-2.5 w-2.5 mr-1" /> {new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}