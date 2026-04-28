"use client";

import { useState } from "react";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User, Phone, Mail, Wallet, Home, FileText } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function AddLeadSheet({ open, onOpenChange }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
      toast.success("Lead created", { description: "The new lead has been added to your pipeline." });
    }, 600);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="font-display text-xl">Add New Lead</SheetTitle>
          <SheetDescription>
            Capture a new prospect's details. You can update them anytime.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <Field icon={User} label="Full name" htmlFor="name">
            <Input id="name" placeholder="e.g. Hamza Iqbal" required />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={Phone} label="Phone" htmlFor="phone">
              <Input id="phone" type="tel" placeholder="+92 3XX XXXXXXX" required />
            </Field>
            <Field icon={Mail} label="Email" htmlFor="email">
              <Input id="email" type="email" placeholder="name@example.com" />
            </Field>
          </div>

          <Field icon={Wallet} label="Budget (PKR)" htmlFor="budget">
            <Input id="budget" type="number" placeholder="e.g. 25000000" required />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Tip: Leads above PKR 20M are auto-tagged as <span className="text-success font-medium">High Priority</span>.
            </p>
          </Field>

          <Field icon={Home} label="Property type" htmlFor="ptype">
            <Select>
              <SelectTrigger id="ptype"><SelectValue placeholder="Select property type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="plot">Residential Plot</SelectItem>
                <SelectItem value="villa">Villa / House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="farmhouse">Farmhouse</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field icon={FileText} label="Notes" htmlFor="notes">
            <Textarea id="notes" rows={4} placeholder="Add context: budget flexibility, preferred location, urgency…" />
          </Field>
        </form>

        <SheetFooter className="p-6 border-t border-border bg-muted/20">
          <div className="flex w-full gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={submitting} className="flex-1 bg-primary hover:bg-primary/90 shadow-glow">
              {submitting ? "Saving…" : "Save lead"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  icon: Icon, label, htmlFor, children,
}: { icon: typeof User; label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  );
}
