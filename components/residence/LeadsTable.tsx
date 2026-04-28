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
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_LEADS, formatPKR, type Lead, type Priority, type LeadStatus } from "@/lib/leads-data";

const priorityStyle: Record<Priority, string> = {
  high: "bg-success-soft text-success border-success/20",
  medium: "bg-warning-soft text-warning border-warning/20",
  low: "bg-danger-soft text-danger border-danger/20",
};

const statusStyle: Record<LeadStatus, string> = {
  new: "text-info",
  contacted: "text-primary",
  negotiating: "text-warning",
  closed: "text-success",
  lost: "text-danger",
};

interface Props {
  onAddLead: () => void;
}

export function LeadsTable({ onAddLead }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  const filtered = leads.filter((l) => {
    const matchesQ =
      !query ||
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.property.toLowerCase().includes(query.toLowerCase());
    const matchesS = statusFilter === "all" || l.status === statusFilter;
    return matchesQ && matchesS;
  });

  const updateStatus = (id: string, s: LeadStatus) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: s } : l)));

  return (
    <Card className="shadow-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 p-5 border-b border-border">
        <div>
          <h2 className="font-display text-lg font-semibold">All Leads</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filtered.length} of {leads.length} leads
          </p>
        </div>
        <div className="md:ml-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/40 border-transparent focus:bg-background"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[170px] h-10 bg-muted/40 border-transparent">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onAddLead} className="h-10 bg-primary hover:bg-primary/90 shadow-glow">
            <Plus className="h-4 w-4 mr-1.5" /> Add New Lead
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-border">
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Lead</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Contact</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Property Interest</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Budget</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Priority</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-display font-semibold text-muted-foreground">Follow-up</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-muted/30 transition border-border">
                <TableCell className="py-4">
                  <div className="font-semibold text-sm">{lead.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{lead.id} · {lead.agent}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> {lead.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" /> {lead.phone}
                    <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-success/15 text-success" title="WhatsApp">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
                        <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l.6.952-1.001 3.648 3.74-.98z"/>
                      </svg>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{lead.property}</TableCell>
                <TableCell className="font-display font-semibold text-sm tabular-nums">
                  {formatPKR(lead.budget)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-semibold capitalize", priorityStyle[lead.priority])}>
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                    {lead.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v as LeadStatus)}>
                    <SelectTrigger className={cn(
                      "h-8 w-[140px] rounded-full border-border bg-transparent text-xs font-semibold capitalize",
                      statusStyle[lead.status]
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{lead.followUp}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
